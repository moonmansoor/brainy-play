import { NextResponse } from "next/server";

import { getServerAuthContext } from "@/features/auth/server-auth";
import {
  applyAttemptToProgress,
  createInitialChildProgress,
  evaluateActivityAccess
} from "@/features/progress/progression-rules";
import { rewardCatalog } from "@/lib/constants/game-economy";
import { validateActivityAttempt } from "@/lib/validation/activity";

function mapRewardDefinition(row: {
  id: string;
  code: string;
  title: string;
  description: string;
  required_brainy_coins: number;
  reward_type: string;
  metadata_json: Record<string, string | number | boolean>;
}) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    requiredBrainyCoins: row.required_brainy_coins,
    rewardType: row.reward_type as
      | "mini-game"
      | "avatar"
      | "certificate",
    metadata: row.metadata_json
  };
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = validateActivityAttempt(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: parsed.error.issues[0]?.message ?? "Attempt payload is invalid."
      },
      { status: 400 }
    );
  }

  const { supabase, user } = await getServerAuthContext();

  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  if (!user) {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const [{ data: child }, { data: activity }, { data: subscriptionRow }, { data: progressRow }, { data: rewardDefinitionRows }, { data: unlockRows }] =
    await Promise.all([
      supabase
        .from("children")
        .select("id, parent_id")
        .eq("id", parsed.data.childId)
        .maybeSingle(),
      supabase
        .from("activities")
        .select("id, required_level")
        .eq("id", parsed.data.activityId)
        .maybeSingle(),
      supabase
        .from("user_subscriptions")
        .select("*")
        .eq("account_id", user.id)
        .maybeSingle(),
      supabase
        .from("child_progress")
        .select("*")
        .eq("child_id", parsed.data.childId)
        .maybeSingle(),
      supabase
        .from("reward_definitions")
        .select("*")
        .order("required_brainy_coins", { ascending: true }),
      supabase
        .from("child_reward_unlocks")
        .select("*")
        .eq("child_id", parsed.data.childId)
    ]);

  if (!child || child.parent_id !== user.id) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Not authorized to save this activity attempt."
      },
      { status: 403 }
    );
  }

  if (!activity) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Activity not found."
      },
      { status: 404 }
    );
  }

  const progress = progressRow
    ? {
        childId: progressRow.child_id,
        currentLevel: progressRow.current_level,
        brainyCoinsBalance: progressRow.brainy_coins_balance,
        totalBrainyCoinsEarned: progressRow.total_brainy_coins_earned,
        totalCorrectAnswers: progressRow.total_correct_answers,
        totalCompletedActivities: progressRow.total_completed_activities,
        lastActivityAt: progressRow.last_activity_at ?? undefined,
        createdAt: progressRow.created_at,
        updatedAt: progressRow.updated_at
      }
    : createInitialChildProgress(parsed.data.childId);
  const subscription = subscriptionRow
    ? {
        id: subscriptionRow.id,
        accountId: subscriptionRow.account_id,
        planType: subscriptionRow.plan_type,
        status: subscriptionRow.status,
        startsAt: subscriptionRow.starts_at ?? undefined,
        endsAt: subscriptionRow.ends_at ?? undefined,
        paymentProvider: subscriptionRow.payment_provider ?? undefined,
        providerCustomerId: subscriptionRow.provider_customer_id ?? undefined,
        providerSubscriptionId:
          subscriptionRow.provider_subscription_id ?? undefined,
        createdAt: subscriptionRow.created_at,
        updatedAt: subscriptionRow.updated_at
      }
    : null;
  const access = evaluateActivityAccess({
    activity: { requiredLevel: activity.required_level },
    progress,
    subscription
  });

  if (!access.isPlayable) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: access.isPremiumOnly
          ? "Subscription required to continue past the free level limit."
          : "This activity level is not unlocked yet.",
        access
      },
      { status: 403 }
    );
  }

  const rewardDefinitions =
    rewardDefinitionRows?.length
      ? rewardDefinitionRows.map((row) =>
          mapRewardDefinition(
            row as {
              id: string;
              code: string;
              title: string;
              description: string;
              required_brainy_coins: number;
              reward_type: string;
              metadata_json: Record<string, string | number | boolean>;
            }
          )
        )
      : rewardCatalog;
  const progression = applyAttemptToProgress({
    childId: parsed.data.childId,
    progress,
    activity: {
      requiredLevel: activity.required_level,
      items: Array.from({ length: Math.max(1, parsed.data.correctAnswersCount) }, () => null)
    },
    attempt: parsed.data,
    existingUnlockCodes: (unlockRows ?? []).map((unlock) => unlock.reward_code),
    rewardDefinitions
  });

  const { error: attemptError } = await supabase.from("activity_attempts").insert({
    child_id: parsed.data.childId,
    activity_id: parsed.data.activityId,
    score: parsed.data.score,
    stars_earned: parsed.data.starsEarned,
    correct_answers_count: parsed.data.correctAnswersCount,
    brainy_coins_earned: progression.brainyCoinsEarned,
    completed: parsed.data.completed,
    hints_used: parsed.data.hintsUsed,
    mistakes_count: parsed.data.mistakesCount,
    duration_seconds: parsed.data.durationSeconds,
    started_at: parsed.data.startedAt,
    finished_at: parsed.data.finishedAt
  });

  if (attemptError) {
    const status = attemptError.code === "42501" ? 403 : 500;
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error:
          status === 403
            ? "Not authorized to save this activity attempt."
            : "Could not save activity attempt."
      },
      { status }
    );
  }

  const { error: progressError } = await supabase.from("child_progress").upsert(
    {
      child_id: progression.nextProgress.childId,
      current_level: progression.nextProgress.currentLevel,
      brainy_coins_balance: progression.nextProgress.brainyCoinsBalance,
      total_brainy_coins_earned: progression.nextProgress.totalBrainyCoinsEarned,
      total_correct_answers: progression.nextProgress.totalCorrectAnswers,
      total_completed_activities: progression.nextProgress.totalCompletedActivities,
      last_activity_at: progression.nextProgress.lastActivityAt ?? null
    },
    {
      onConflict: "child_id"
    }
  );

  if (progressError) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Activity attempt saved, but progress could not be updated."
      },
      { status: progressError.code === "42501" ? 403 : 500 }
    );
  }

  if (progression.unlockedRewardDefinitions.length > 0) {
    const { error: unlockError } = await supabase.from("child_reward_unlocks").insert(
      progression.unlockedRewardDefinitions.map((reward) => ({
        child_id: parsed.data.childId,
        reward_code: reward.code,
        reward_type: reward.rewardType,
        unlocked_at: parsed.data.finishedAt
      }))
    );

    if (unlockError && unlockError.code !== "23505") {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Progress saved, but reward unlocks could not be updated."
        },
        { status: unlockError.code === "42501" ? 403 : 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    persisted: true,
    access,
    progression: {
      progress: progression.nextProgress,
      brainyCoinsEarned: progression.brainyCoinsEarned,
      awardBreakdown: progression.awardBreakdown,
      previousLevel: progression.previousLevel,
      nextLevel: progression.nextLevel,
      didLevelUp: progression.didLevelUp,
      unlockedRewards: progression.unlockedRewardDefinitions
    }
  });
}
