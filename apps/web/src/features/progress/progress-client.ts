import { listActivities } from "@/features/activities/repository";
import { listChildAttempts } from "@/features/child-profiles/child-profiles-client";
import {
  applyAttemptToProgress,
  createInitialChildProgress,
  deriveProgressFromAttempts
} from "@/features/progress/progression-rules";
import { getParentSubscription } from "@/features/subscriptions/subscription-client";
import { rewardCatalog } from "@/lib/constants/game-economy";
import {
  sampleChildProgress,
  sampleRewardUnlocks
} from "@/lib/constants/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  loadLocalChildProgress,
  loadLocalRewardUnlocks,
  saveLocalChildProgress,
  saveLocalRewardUnlocks
} from "@/lib/utils/storage";
import {
  ActivityCompletionPayload,
  ActivityDefinition,
  ChildProfile,
  ChildProgress,
  RewardDefinition,
  RewardUnlock,
  UserSubscription
} from "@/types/activity";

function mapChildProgress(row: {
  child_id: string;
  current_level: number;
  brainy_coins_balance: number;
  total_brainy_coins_earned: number;
  total_correct_answers: number;
  total_completed_activities: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}): ChildProgress {
  return {
    childId: row.child_id,
    currentLevel: row.current_level,
    brainyCoinsBalance: row.brainy_coins_balance,
    totalBrainyCoinsEarned: row.total_brainy_coins_earned,
    totalCorrectAnswers: row.total_correct_answers,
    totalCompletedActivities: row.total_completed_activities,
    lastActivityAt: row.last_activity_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRewardDefinition(row: {
  id: string;
  code: string;
  title: string;
  description: string;
  required_brainy_coins: number;
  reward_type: string;
  metadata_json: Record<string, string | number | boolean>;
}): RewardDefinition {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    requiredBrainyCoins: row.required_brainy_coins,
    rewardType: row.reward_type as RewardDefinition["rewardType"],
    metadata: row.metadata_json
  };
}

function mapRewardUnlock(row: {
  id: string;
  child_id: string;
  reward_code: string;
  reward_type: string;
  unlocked_at: string;
}): RewardUnlock {
  return {
    id: row.id,
    childId: row.child_id,
    rewardCode: row.reward_code,
    rewardType: row.reward_type as RewardUnlock["rewardType"],
    unlockedAt: row.unlocked_at
  };
}

function uniqueUnlocks(unlocks: RewardUnlock[]) {
  const byCode = new Map<string, RewardUnlock>();

  for (const unlock of unlocks) {
    const key = `${unlock.childId}:${unlock.rewardCode}`;
    if (!byCode.has(key)) {
      byCode.set(key, unlock);
    }
  }

  return Array.from(byCode.values()).sort((left, right) =>
    left.unlockedAt.localeCompare(right.unlockedAt)
  );
}

async function loadRewardDefinitionsFromSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("reward_definitions")
    .select("*")
    .order("required_brainy_coins", { ascending: true });

  if (error || !data?.length) return null;
  return data.map((row) =>
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
  );
}

export async function listRewardDefinitions() {
  return (await loadRewardDefinitionsFromSupabase()) ?? rewardCatalog;
}

export async function getChildExperience(child: ChildProfile) {
  const supabase = getSupabaseBrowserClient();
  const [activities, attempts, rewardDefinitions, subscription] = await Promise.all([
    listActivities(),
    listChildAttempts(child.id),
    listRewardDefinitions(),
    getParentSubscription(child.parentId)
  ]);

  if (!supabase) {
    const progress =
      loadLocalChildProgress().find((item) => item.childId === child.id) ??
      sampleChildProgress.find((item) => item.childId === child.id) ??
      deriveProgressFromAttempts({
        childId: child.id,
        attempts,
        activities,
        existingUnlockCodes: uniqueUnlocks([
          ...sampleRewardUnlocks,
          ...loadLocalRewardUnlocks()
        ])
          .filter((unlock) => unlock.childId === child.id)
          .map((unlock) => unlock.rewardCode),
        rewardDefinitions
      }).progress;
    const rewardUnlocks = uniqueUnlocks([
      ...sampleRewardUnlocks,
      ...loadLocalRewardUnlocks()
    ]).filter((unlock) => unlock.childId === child.id);

    return {
      progress,
      rewardUnlocks,
      rewardDefinitions,
      subscription
    };
  }

  const [{ data: progressRow }, { data: unlockRows }] = await Promise.all([
    supabase
      .from("child_progress")
      .select("*")
      .eq("child_id", child.id)
      .maybeSingle(),
    supabase
      .from("child_reward_unlocks")
      .select("*")
      .eq("child_id", child.id)
      .order("unlocked_at", { ascending: true })
  ]);

  const rewardUnlocks = uniqueUnlocks(
    (unlockRows ?? []).map((row) =>
      mapRewardUnlock(
        row as {
          id: string;
          child_id: string;
          reward_code: string;
          reward_type: string;
          unlocked_at: string;
        }
      )
    )
  );

  const progress =
    (progressRow
      ? mapChildProgress(
          progressRow as {
            child_id: string;
            current_level: number;
            brainy_coins_balance: number;
            total_brainy_coins_earned: number;
            total_correct_answers: number;
            total_completed_activities: number;
            last_activity_at: string | null;
            created_at: string;
            updated_at: string;
          }
        )
      : null) ??
    deriveProgressFromAttempts({
      childId: child.id,
      attempts,
      activities,
      existingUnlockCodes: rewardUnlocks.map((unlock) => unlock.rewardCode),
      rewardDefinitions
    }).progress;

  return {
    progress,
    rewardUnlocks,
    rewardDefinitions,
    subscription
  };
}

export async function applyLocalAttemptProgress(input: {
  child: ChildProfile;
  activity: ActivityDefinition;
  payload: ActivityCompletionPayload;
}) {
  const [rewardDefinitions, subscription] = await Promise.all([
    listRewardDefinitions(),
    getParentSubscription(input.child.parentId)
  ]);
  const currentProgress =
    loadLocalChildProgress().find((item) => item.childId === input.child.id) ??
    sampleChildProgress.find((item) => item.childId === input.child.id) ??
    createInitialChildProgress(input.child.id);
  const currentUnlocks = uniqueUnlocks([
    ...sampleRewardUnlocks,
    ...loadLocalRewardUnlocks()
  ]).filter((unlock) => unlock.childId === input.child.id);
  const result = applyAttemptToProgress({
    childId: input.child.id,
    progress: currentProgress,
    activity: input.activity,
    attempt: input.payload,
    existingUnlockCodes: currentUnlocks.map((unlock) => unlock.rewardCode),
    rewardDefinitions
  });

  saveLocalChildProgress(result.nextProgress);

  const nextUnlocks = uniqueUnlocks([
    ...currentUnlocks,
    ...result.unlockedRewardDefinitions.map((reward) => ({
      id: crypto.randomUUID(),
      childId: input.child.id,
      rewardCode: reward.code,
      rewardType: reward.rewardType,
      unlockedAt: input.payload.finishedAt
    }))
  ]);

  saveLocalRewardUnlocks([
    ...loadLocalRewardUnlocks().filter((unlock) => unlock.childId !== input.child.id),
    ...nextUnlocks
  ]);

  return {
    ...result,
    subscription,
    rewardDefinitions,
    rewardUnlocks: nextUnlocks
  };
}

export function buildDefaultExperience(
  child: ChildProfile,
  subscription: UserSubscription | null = null
) {
  return {
    progress: createInitialChildProgress(child.id),
    rewardDefinitions: rewardCatalog,
    rewardUnlocks: [] as RewardUnlock[],
    subscription
  };
}
