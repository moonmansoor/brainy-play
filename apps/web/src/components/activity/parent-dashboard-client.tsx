"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getSkillAreaLabel } from "@/features/adaptive-learning/skill-taxonomy";
import { getActivityInteractionLabel } from "@/features/activities/template-registry";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import { listChildAttempts } from "@/features/child-profiles/child-profiles-client";
import { buildChildSnapshot, mergeAttempts } from "@/features/progress/progress-utils";
import { sampleActivities, sampleBadges } from "@/lib/constants/sample-data";
import {
  getActivityTypeLabel,
  getChildThemePreferences,
  getThemePack
} from "@/lib/utils/activity";
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

  useEffect(() => {
    async function hydrate() {
      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));

      const localAttempts = loadStoredAttempts();
      if (resolved.child) {
        try {
          const remoteAttempts = await listChildAttempts(resolved.child.id);
          setStoredAttempts(mergeAttempts([...localAttempts, ...remoteAttempts]));
          return;
        } catch {
          // fall through to local/sample attempts
        }
      }

      setStoredAttempts(mergeAttempts(localAttempts));
    }

    void hydrate();
  }, [childId]);

  const snapshot = activeChild
    ? buildChildSnapshot(activeChild, storedAttempts, sampleActivities)
    : null;

  if (!snapshot) {
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

  const favoriteTheme = getThemePack(
    getChildThemePreferences(snapshot.child).favoriteThemes[0]
  );

  return (
    <div className="grid gap-6">
      <Panel className="overflow-hidden p-0">
        <div className={`grid gap-6 bg-gradient-to-r ${favoriteTheme.gradient} p-6 lg:grid-cols-[1fr_0.9fr]`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-600">
              Favorite visual world
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {snapshot.child.displayName} is exploring {favoriteTheme.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Preferred reward style:{" "}
              <span className="font-bold capitalize">
                {getChildThemePreferences(snapshot.child).preferredRewardStyle}
              </span>
              . Theme choices are now used to prioritize thumbnails and activity
              scenes.
            </p>
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
            {snapshot.overallLevel}
          </p>
          <p className="mt-2 text-sm text-slate-600">{snapshot.overallLevelLabel}</p>
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
            Success rate
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {snapshot.averageSuccessRate}%
          </p>
        </Panel>
        <Panel className="bg-gradient-to-br from-violet-100 to-white">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Avg difficulty
          </p>
          <p className="mt-3 font-display text-5xl font-semibold">
            {snapshot.averageDifficulty}
          </p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel>
          <h2 className="font-display text-3xl font-semibold">Recent activity</h2>
          {snapshot.activePracticeFocus ? (
            <p className="mt-2 text-sm text-slate-600">{snapshot.currentPracticeReason}</p>
          ) : null}
          <div className="mt-5 grid gap-3">
            {snapshot.recentAttempts.map((attempt) => {
              const activity = sampleActivities.find(
                (item) => item.id === attempt.activityId
              );

              return (
                <div
                  key={attempt.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold">{activity?.title ?? "Activity"}</p>
                    <p className="text-sm text-slate-600">
                      {activity ? getActivityTypeLabel(activity.type) : "Activity"} •{" "}
                      {getActivityInteractionLabel(attempt.interactionType)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <p>{attempt.score} points</p>
                    <p>{attempt.successRate}% success</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel>
            <h2 className="font-display text-3xl font-semibold">Practicing now</h2>
            {snapshot.activePracticeFocus ? (
              <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-4">
                <p className="font-semibold">{snapshot.activePracticeFocus.levelLabel}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {getSkillAreaLabel(snapshot.activePracticeFocus.skillArea)}
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  Mastery {snapshot.activePracticeFocus.masteryScore}% after{" "}
                  {snapshot.activePracticeFocus.attemptsAtCurrentLevel} recent rounds.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {snapshot.activePracticeFocus.nextGoal}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No skill data yet. Start a fresh activity to build a mastery profile.
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Strengths</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.strengths.map((item) => (
                <div key={item.skillArea}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>{getSkillAreaLabel(item.skillArea)}</span>
                    <span>{item.masteryScore}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-emerald-400"
                      style={{ width: `${item.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Needs more practice</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.needsPractice.map((item) => (
                <div key={item.skillArea}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>{getSkillAreaLabel(item.skillArea)}</span>
                    <span>{item.masteryScore}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-amber-400"
                      style={{ width: `${item.masteryScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.nextGoal}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Learning areas</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.learningAreaBreakdown.map((item) => (
                <div key={item.area}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>{item.area}</span>
                    <span>{item.average}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-sky-400"
                      style={{ width: `${item.average}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Rewards</h2>
            <div className="mt-4 grid gap-3">
              {sampleBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-[1.5rem] bg-slate-50 p-4"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
                    <Image
                      src={badge.imageUrl ?? "/images/rewards/star-burst.svg"}
                      alt={badge.title}
                      fill
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{badge.title}</p>
                    <p className="text-sm text-slate-600">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-3xl font-semibold">Recommended next</h2>
            <div className="mt-5 grid gap-3">
              {snapshot.recommended.map((activity) => (
                <div key={activity.id} className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="font-semibold">{activity.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {getActivityTypeLabel(activity.type)} • {getSkillAreaLabel(activity.primarySkillArea!)}
                  </p>
                </div>
              ))}
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
