"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { ActivityEngine } from "@/components/activity/activity-engine";
import { RewardStrip } from "@/components/activity/reward-strip";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getActivityBySlug } from "@/features/activities/repository";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import { markChildLastLogin } from "@/features/child-profiles/child-profiles-client";
import {
  applyAttemptToProgress,
  evaluateActivityAccess
} from "@/features/progress/progression-rules";
import {
  applyLocalAttemptProgress,
  getChildExperience
} from "@/features/progress/progress-client";
import { BRAINY_COIN_LABEL } from "@/lib/constants/game-economy";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildAttemptPayload,
  formatDifficulty,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildThemePreferences,
  getThemePack
} from "@/lib/utils/activity";
import { saveAttemptLocally } from "@/lib/utils/storage";
import {
  ActivityCompletionPayload,
  ActivityDefinition,
  ActivityOutcome,
  ChildProgress,
  ChildProfile,
  RewardDefinition
} from "@/types/activity";

type CompletionState = {
  outcome: ActivityOutcome;
  brainyCoinsEarned: number;
  currentBalance: number;
  didLevelUp: boolean;
  nextLevel: number;
  unlockedRewards: RewardDefinition[];
};

export function ActivityPlayerClient({
  slug,
  childId
}: {
  slug: string;
  childId?: string;
}) {
  const [activity, setActivity] = useState<ActivityDefinition | null>(null);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [completion, setCompletion] = useState<CompletionState | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState<Awaited<
    ReturnType<typeof getChildExperience>
  > | null>(null);

  useEffect(() => {
    async function hydrate() {
      setLoading(true);
      const nextActivity = await getActivityBySlug(slug);
      setActivity(nextActivity);

      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));

      if (resolved.child) {
        await markChildLastLogin(resolved.child.id);
        setExperience(await getChildExperience(resolved.child));
      } else {
        setExperience(null);
      }

      setLoading(false);
    }

    void hydrate();
  }, [childId, slug]);

  const visualTheme = useMemo(
    () => (activity ? getActivityVisualTheme(activity, activeChild) : null),
    [activity, activeChild]
  );
  const themePack = visualTheme ? getThemePack(visualTheme.themeId) : null;
  const rewardStyle = getChildThemePreferences(activeChild).preferredRewardStyle;
  const accessState =
    activity && experience
      ? evaluateActivityAccess({
          activity,
          progress: experience.progress,
          subscription: experience.subscription
        })
      : null;

  async function syncAttempt(payload: ActivityCompletionPayload) {
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return {
      status: response.status,
      body: (await response.json()) as {
        ok: boolean;
        persisted: boolean;
        error?: string;
        progression?: {
          progress: ChildProgress;
          brainyCoinsEarned: number;
          previousLevel: number;
          nextLevel: number;
          didLevelUp: boolean;
          unlockedRewards: RewardDefinition[];
        };
      }
    };
  }

  function buildCompletionState(outcome: ActivityOutcome) {
    if (!activity || !activeChild || !experience) return null;

    const startedAt = new Date(
      Date.now() - outcome.durationSeconds * 1000
    ).toISOString();
    const finishedAt = new Date().toISOString();
    const payload = buildAttemptPayload({
      child: activeChild,
      activity,
      outcome,
      startedAt,
      finishedAt
    });
    const preview = applyAttemptToProgress({
      childId: activeChild.id,
      progress: experience.progress,
      activity,
      attempt: payload,
      existingUnlockCodes: experience.rewardUnlocks.map((unlock) => unlock.rewardCode),
      rewardDefinitions: experience.rewardDefinitions
    });

    return {
      payload,
      preview: {
        outcome,
        brainyCoinsEarned: preview.brainyCoinsEarned,
        currentBalance: preview.nextProgress.brainyCoinsBalance,
        didLevelUp: preview.didLevelUp,
        nextLevel: preview.nextLevel,
        unlockedRewards: preview.unlockedRewardDefinitions
      } satisfies CompletionState
    };
  }

  function handleComplete(outcome: ActivityOutcome) {
    if (!activity || !activeChild || !experience) return;

    const completionState = buildCompletionState(outcome);
    if (!completionState) return;

    saveAttemptLocally(completionState.payload, {
      brainyCoinsEarned: completionState.preview.brainyCoinsEarned
    });
    setCompletion(completionState.preview);

    startTransition(async () => {
      try {
        if (!getSupabaseBrowserClient()) {
          const localResult = await applyLocalAttemptProgress({
            child: activeChild,
            activity,
            payload: completionState.payload
          });
          setExperience({
            progress: localResult.nextProgress,
            rewardDefinitions: localResult.rewardDefinitions,
            rewardUnlocks: localResult.rewardUnlocks,
            subscription: localResult.subscription
          });
          setCompletion({
            outcome,
            brainyCoinsEarned: localResult.brainyCoinsEarned,
            currentBalance: localResult.nextProgress.brainyCoinsBalance,
            didLevelUp: localResult.didLevelUp,
            nextLevel: localResult.nextLevel,
            unlockedRewards: localResult.unlockedRewardDefinitions
          });
          setSubmitMessage("Progress saved in demo mode.");
          return;
        }

        const result = await syncAttempt(completionState.payload);
        if (!result.body.ok || !result.body.progression) {
          throw new Error(result.body.error ?? "Cloud save failed.");
        }
        const progression = result.body.progression;

        setExperience((current) =>
          current
            ? {
                ...current,
                progress: progression.progress,
                rewardUnlocks: [
                  ...current.rewardUnlocks,
                  ...progression.unlockedRewards.map((reward) => ({
                    id: `${activeChild.id}:${reward.code}:${completionState.payload.finishedAt}`,
                    childId: activeChild.id,
                    rewardCode: reward.code,
                    rewardType: reward.rewardType,
                    unlockedAt: completionState.payload.finishedAt
                  }))
                ]
              }
            : current
        );
        setCompletion({
          outcome,
          brainyCoinsEarned: progression.brainyCoinsEarned,
          currentBalance: progression.progress.brainyCoinsBalance,
          didLevelUp: progression.didLevelUp,
          nextLevel: progression.nextLevel,
          unlockedRewards: progression.unlockedRewards
        });
        setSubmitMessage("Progress saved to Supabase.");
      } catch {
        const localResult = await applyLocalAttemptProgress({
          child: activeChild,
          activity,
          payload: completionState.payload
        });
        setExperience({
          progress: localResult.nextProgress,
          rewardDefinitions: localResult.rewardDefinitions,
          rewardUnlocks: localResult.rewardUnlocks,
          subscription: localResult.subscription
        });
        setCompletion({
          outcome,
          brainyCoinsEarned: localResult.brainyCoinsEarned,
          currentBalance: localResult.nextProgress.brainyCoinsBalance,
          didLevelUp: localResult.didLevelUp,
          nextLevel: localResult.nextLevel,
          unlockedRewards: localResult.unlockedRewardDefinitions
        });
        setSubmitMessage("Cloud save failed. Progress was kept in demo mode.");
      }
    });
  }

  if (loading) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">Loading activity...</p>
      </Panel>
    );
  }

  if (!activity || !activeChild || !visualTheme || !themePack || !experience) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">
          {authReady ? "Activity not found" : "Parent login required"}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {authReady
            ? "Choose a learner and return to the library."
            : "Sign in as a parent, then select a child profile to start a learning session."}
        </p>
        <div className="mt-4">
          <LinkButton href={authReady ? "/child" : "/auth/login"}>
            {authReady ? "Back to child profiles" : "Parent login"}
          </LinkButton>
        </div>
      </Panel>
    );
  }

  if (accessState && !accessState.isPlayable) {
    return (
      <Panel className="grid gap-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
          Activity locked
        </p>
        <h2 className="font-display text-3xl font-semibold">
          {accessState.isPremiumOnly
            ? "Subscription needed for this level"
            : `Reach level ${accessState.requiredLevel} first`}
        </h2>
        <p className="text-sm leading-6 text-slate-700">
          {accessState.isPremiumOnly
            ? `Free play ends at level ${accessState.freeLevelLimit}. Ask a grown-up to unlock the next adventure.`
            : `This activity opens after ${activeChild.displayName} reaches level ${accessState.requiredLevel}.`}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/child/activities?childId=${activeChild.id}`} variant="secondary">
            Back to library
          </LinkButton>
          {accessState.isPremiumOnly ? (
            <LinkButton href={`/parent?childId=${activeChild.id}`}>
              Ask a grown-up to upgrade
            </LinkButton>
          ) : null}
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-0">
        <div className={`grid gap-4 bg-gradient-to-r ${themePack.gradient} p-6 lg:grid-cols-[1fr_0.8fr] lg:items-center`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-600">
              {themePack.sticker} {getActivityTypeLabel(activity.type)} in {themePack.name}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {visualTheme.heroTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              {visualTheme.heroHint}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em]">
              <span className="rounded-full bg-white/75 px-4 py-2 text-slate-700">
                {formatDifficulty(activity.difficulty)}
              </span>
              <span className="rounded-full bg-white/75 px-4 py-2 text-slate-700">
                Level {activity.requiredLevel}
              </span>
              <span className="rounded-full bg-white/75 px-4 py-2 text-slate-700">
                {BRAINY_COIN_LABEL}: {experience.progress.brainyCoinsBalance}
              </span>
            </div>
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-[2rem] border border-white/60 bg-white/40">
            <Image
              src={visualTheme.imageUrl}
              alt={visualTheme.cardTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        </div>
      </Panel>

      <ActivityEngine
        activity={activity}
        visualTheme={visualTheme}
        themePack={themePack}
        onComplete={handleComplete}
      />

      {completion ? (
        <RewardStrip
          stars={completion.outcome.starsEarned}
          rewardStyle={rewardStyle ?? "sparkles"}
          message={`${activeChild.displayName} earned ${completion.outcome.starsEarned} star${completion.outcome.starsEarned === 1 ? "" : "s"}`}
          brainyCoinsEarned={completion.brainyCoinsEarned}
          currentBalance={completion.currentBalance}
          didLevelUp={completion.didLevelUp}
          unlockedRewards={completion.unlockedRewards}
        />
      ) : null}

      {completion ? (
        <Panel className="bg-gradient-to-r from-emerald-100 to-lime-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Celebration complete
              </p>
              <p className="mt-2 text-sm text-emerald-900">
                Score {completion.outcome.score}. Mistakes {completion.outcome.mistakesCount}.
                {" "}
                Next level {completion.nextLevel}. {submitMessage || (isPending ? "Saving progress..." : "")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={`/child/activities?childId=${activeChild.id}`}
                variant="secondary"
              >
                More activities
              </LinkButton>
              <Link
                href={`/parent?childId=${activeChild.id}`}
                className="inline-flex min-h-12 items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
              >
                View progress
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            window.location.href = `/child/activities?childId=${activeChild.id}`;
          }}
        >
          Exit activity
        </Button>
      </div>
    </div>
  );
}
