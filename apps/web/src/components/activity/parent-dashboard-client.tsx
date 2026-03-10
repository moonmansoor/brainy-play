"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { listActivities } from "@/features/activities/repository";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import { listChildAttempts } from "@/features/child-profiles/child-profiles-client";
import { buildChildSnapshot, mergeAttempts } from "@/features/progress/progress-utils";
import { isSubscriptionActive } from "@/features/progress/progression-rules";
import { getChildExperience } from "@/features/progress/progress-client";
import { activatePremiumSubscription } from "@/features/subscriptions/subscription-client";
import {
  BRAINY_COIN_LABEL,
  FREE_PLAY_LEVEL_LIMIT
} from "@/lib/constants/game-economy";
import { getThemePack } from "@/lib/utils/activity";
import { loadStoredAttempts } from "@/lib/utils/storage";
import { ChildProfile } from "@/types/activity";

export function ParentDashboardClient({
  childId
}: {
  childId?: string;
}) {
  const [storedAttempts, setStoredAttempts] = useState(() => mergeAttempts([]));
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>>>([]);
  const [experience, setExperience] = useState<Awaited<
    ReturnType<typeof getChildExperience>
  > | null>(null);
  const [message, setMessage] = useState("");
  const [isUpgrading, startUpgrade] = useTransition();

  useEffect(() => {
    async function hydrate() {
      setLoading(true);
      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));

      const localAttempts = loadStoredAttempts();
      const nextActivities = await listActivities();
      setActivities(nextActivities);

      if (resolved.child) {
        try {
          const [remoteAttempts, nextExperience] = await Promise.all([
            listChildAttempts(resolved.child.id),
            getChildExperience(resolved.child)
          ]);
          setStoredAttempts(mergeAttempts([...localAttempts, ...remoteAttempts]));
          setExperience(nextExperience);
          setLoading(false);
          return;
        } catch {
          // fall through to local/sample state
        }
      }

      setStoredAttempts(mergeAttempts(localAttempts));
      setExperience(null);
      setLoading(false);
    }

    void hydrate();
  }, [childId]);

  if (loading) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">Loading progress...</p>
      </Panel>
    );
  }

  const snapshot =
    activeChild && activities.length
      ? buildChildSnapshot(activeChild, storedAttempts, activities)
      : null;

  if (!snapshot || !activeChild) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">
          {authReady ? "Choose a child to view progress" : "Parent login required"}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {authReady
            ? "Return to child profiles and select a learner."
            : "Sign in as a parent, then select a child profile to view progress."}
        </p>
        {!authReady ? (
          <div className="mt-4">
            <LinkButton href="/auth/login">Parent login</LinkButton>
          </div>
        ) : null}
      </Panel>
    );
  }

  const favoriteTheme = getThemePack(snapshot.child.themePreferences?.favoriteThemes[0] ?? "animals");
  const hasPremium = isSubscriptionActive(experience?.subscription);
  const unlockedRewardCodes = new Set(
    experience?.rewardUnlocks.map((unlock) => unlock.rewardCode) ?? []
  );

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-0">
        <div className={`grid gap-6 bg-gradient-to-r ${favoriteTheme.gradient} p-6 lg:grid-cols-[1fr_0.9fr]`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-600">
              Subscription and rewards
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {snapshot.child.displayName} is on level {experience?.progress.currentLevel ?? 1}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {hasPremium
                ? "Premium access is active across every level."
                : `Free access is active through level ${FREE_PLAY_LEVEL_LIMIT}. Premium levels stay visible but locked until the account upgrades.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Access
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {hasPremium ? "Premium" : "Free"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  {BRAINY_COIN_LABEL}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {experience?.progress.brainyCoinsBalance ?? 0}
                </p>
              </div>
            </div>
            {!hasPremium ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8b5f] to-[#ff6e70] px-5 py-3 text-sm font-bold text-white shadow-playful transition hover:-translate-y-0.5"
                  disabled={isUpgrading}
                  onClick={() =>
                    startUpgrade(async () => {
                      try {
                        const subscription = await activatePremiumSubscription({
                          parentId: activeChild.parentId
                        });
                        setExperience((current) =>
                          current
                            ? {
                                ...current,
                                subscription
                              }
                            : current
                        );
                        setMessage("Premium access activated.");
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : "Premium access could not be activated."
                        );
                      }
                    })
                  }
                >
                  {isUpgrading ? "Activating..." : "Activate premium access"}
                </button>
                {message ? <p className="text-sm text-slate-700">{message}</p> : null}
              </div>
            ) : null}
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-[2rem] border border-white/60 bg-white/40">
            <Image
              src={favoriteTheme.imageUrl}
              alt={favoriteTheme.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-4">
        <Panel className="bg-gradient-to-br from-orange-100 to-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Current level
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {experience?.progress.currentLevel ?? 1}
          </p>
        </Panel>
        <Panel className="bg-gradient-to-br from-yellow-100 to-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            {BRAINY_COIN_LABEL}
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {experience?.progress.brainyCoinsBalance ?? 0}
          </p>
        </Panel>
        <Panel className="bg-gradient-to-br from-sky-100 to-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Total stars
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {snapshot.totalStars}
          </p>
        </Panel>
        <Panel className="bg-gradient-to-br from-emerald-100 to-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Attempts
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {snapshot.totalAttempts}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Panel>
          <h2 className="font-display text-3xl font-semibold">Reward milestones</h2>
          <div className="mt-5 grid gap-3">
            {(experience?.rewardDefinitions ?? []).map((reward) => {
              const isUnlocked = unlockedRewardCodes.has(reward.code);
              const totalCoins = experience?.progress.totalBrainyCoinsEarned ?? 0;
              const progress = Math.min(
                100,
                Math.round((totalCoins / reward.requiredBrainyCoins) * 100)
              );

              return (
                <div
                  key={reward.code}
                  className={`rounded-[1.5rem] p-4 ${
                    isUnlocked ? "bg-emerald-50" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{reward.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">
                        {reward.requiredBrainyCoins} {BRAINY_COIN_LABEL}
                      </p>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {isUnlocked ? "Unlocked" : "In progress"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white">
                    <div
                      className={`h-3 rounded-full ${
                        isUnlocked ? "bg-emerald-400" : "bg-orange-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel>
            <h2 className="font-display text-3xl font-semibold">Recent activity</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.recentAttempts.map((attempt) => {
                const activity = activities.find((item) => item.id === attempt.activityId);

                return (
                  <div
                    key={attempt.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold">{activity?.title ?? "Activity"}</p>
                      <p className="text-sm text-slate-600">
                        +{attempt.brainyCoinsEarned} {BRAINY_COIN_LABEL}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{attempt.score} points</p>
                      <p>{attempt.correctAnswersCount} correct answers</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Next steps</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="font-semibold">
                  {hasPremium
                    ? "All premium levels are open."
                    : `Upgrade to continue after level ${FREE_PLAY_LEVEL_LIMIT}.`}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Current total earned: {experience?.progress.totalBrainyCoinsEarned ?? 0}{" "}
                  {BRAINY_COIN_LABEL}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="font-semibold">Rewards unlocked</p>
                <p className="mt-1 text-sm text-slate-600">
                  {experience?.rewardUnlocks.length ?? 0} reward milestone
                  {(experience?.rewardUnlocks.length ?? 0) === 1 ? "" : "s"} earned
                </p>
              </div>
            </div>
            <div className="mt-5">
              <LinkButton href={`/child/activities?childId=${snapshot.child.id}`}>
                Open activity library
              </LinkButton>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
