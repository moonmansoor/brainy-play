"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { ActivityEngine } from "@/components/activity/activity-engine";
import { RewardStrip } from "@/components/activity/reward-strip";
import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button, LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildAdaptiveActivitySession } from "@/features/adaptive-learning/task-generator";
import { getSkillAreaLabel } from "@/features/adaptive-learning/skill-taxonomy";
import { getActivityBySlug } from "@/features/activities/repository";
import { getActivityInteractionLabel } from "@/features/activities/template-registry";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import {
  listChildAttempts,
  markChildLastLogin
} from "@/features/child-profiles/child-profiles-client";
import {
  buildAttemptPayload,
  formatDifficulty,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildThemePreferences,
  getThemePack
} from "@/lib/utils/activity";
import { loadStoredAttempts, saveAttemptLocally } from "@/lib/utils/storage";
import {
  ActivityAttempt,
  AdaptiveActivitySession,
  ActivityCompletionPayload,
  ActivityDefinition,
  ActivityOutcome,
  ChildProfile
} from "@/types/activity";

export function ActivityPlayerClient({
  slug,
  childId
}: {
  slug: string;
  childId?: string;
}) {
  const [activity, setActivity] = useState<ActivityDefinition | null>(null);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [session, setSession] = useState<AdaptiveActivitySession | null>(null);
  const [attempts, setAttempts] = useState<ActivityAttempt[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [completion, setCompletion] = useState<ActivityOutcome | null>(null);
  const [completionPayload, setCompletionPayload] =
    useState<ActivityCompletionPayload | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      setLoading(true);
      setSession(null);
      setAttempts([]);
      const nextActivity = await getActivityBySlug(slug);
      setActivity(nextActivity);

      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));
      setCompletion(null);
      setCompletionPayload(null);

      if (resolved.child) {
        await markChildLastLogin(resolved.child.id);

        const localAttempts = loadStoredAttempts().filter(
          (attempt) => attempt.childId === resolved.child?.id
        );
        let remoteAttempts: ActivityAttempt[] = [];

        try {
          remoteAttempts = await listChildAttempts(resolved.child.id);
        } catch {
          remoteAttempts = [];
        }

        const mergedAttempts = [...localAttempts, ...remoteAttempts].sort(
          (left, right) =>
            new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime()
        );
        setAttempts(mergedAttempts);

        if (nextActivity) {
          setSession(
            buildAdaptiveActivitySession({
              activity: nextActivity,
              child: resolved.child,
              attempts: mergedAttempts
            })
          );
        }
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

  async function syncAttempt(payload: ActivityCompletionPayload) {
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  function handleComplete(outcome: ActivityOutcome) {
    if (!activity || !activeChild) return;

    const startedAt = new Date(
      Date.now() - outcome.durationSeconds * 1000
    ).toISOString();
    const finishedAt = new Date().toISOString();
    const payload = buildAttemptPayload({
      child: activeChild,
      activity,
      outcome,
      startedAt,
      finishedAt,
      session: session ?? undefined,
      priorAttempts: attempts
    });

    const localAttempt = saveAttemptLocally(payload);
    setCompletion(outcome);
    setCompletionPayload(payload);
    if (localAttempt) {
      const nextAttempts = [localAttempt, ...attempts];
      setAttempts(nextAttempts);
      if (session) {
        setSession(
          buildAdaptiveActivitySession({
            activity,
            child: activeChild,
            attempts: nextAttempts
          })
        );
      }
    }

    startTransition(async () => {
      try {
        const result = await syncAttempt(payload);
        setSubmitMessage(
          result.persisted
            ? "Progress saved to Supabase."
            : "Progress saved in demo mode."
        );
      } catch {
        setSubmitMessage("Progress saved in demo mode.");
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

  if (!activity || !activeChild || !visualTheme || !themePack) {
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
                Ages {activity.ageMin}-{activity.ageMax}
              </span>
              <span className="rounded-full bg-white/75 px-4 py-2 text-slate-700">
                {getActivityInteractionLabel(activity.interactionType)}
              </span>
              {session ? (
                <span className="rounded-full bg-white/75 px-4 py-2 text-slate-700">
                  {session.levelLabel}
                </span>
              ) : null}
            </div>
            <div className="mt-5">
              <MascotBrain
                state="teaching"
                animation="float"
                size="sm"
                message="Brainy will show the steps, cheer you on, and keep every challenge playful."
              />
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
        items={session?.generatedItems}
        levelLabel={session?.levelLabel}
        focusLabel={session ? getSkillAreaLabel(session.skillArea) : undefined}
        visualTheme={visualTheme}
        themePack={themePack}
        onComplete={handleComplete}
      />

      {completion ? (
        <RewardStrip
          stars={completion.starsEarned}
          rewardStyle={rewardStyle ?? "sparkles"}
          message={`${activeChild.displayName} earned ${completion.starsEarned} star${completion.starsEarned === 1 ? "" : "s"}`}
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
                Score {completion.score}. Mistakes {completion.mistakesCount}.{" "}
                {submitMessage || (isPending ? "Saving progress..." : "")}
              </p>
              {completionPayload?.levelAdvanced ? (
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  New level unlocked: Level {completionPayload.masteryLevelAfter}.
                </p>
              ) : completionPayload?.masteryLevelAfter ? (
                <p className="mt-2 text-sm font-semibold text-emerald-800">
                  Keep going at Level {completionPayload.masteryLevelAfter} for stronger mastery.
                </p>
              ) : null}
            </div>
            <MascotBrain
              state={completionPayload?.levelAdvanced ? "celebrating" : "happy"}
              animation={completionPayload?.levelAdvanced ? "bounce" : "float"}
              size="sm"
              message={
                completionPayload?.levelAdvanced
                  ? "Brainy says you unlocked the next level."
                  : "Brainy says keep going, you are building strong thinking skills."
              }
            />
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

      {completion ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="bg-gradient-to-br from-sky-50 to-white">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">
              What you learned
            </p>
            <div className="mt-3">
              <MascotBrain
                state="teaching"
                size="sm"
                animation="float"
                message="Brainy turns every activity into a coding-thinking lesson."
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {session?.explanationText ?? activity.explanationText}
            </p>
          </Panel>
          <Panel className="bg-gradient-to-br from-violet-50 to-white">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-700">
              Fun fact
            </p>
            <div className="mt-3">
              <MascotBrain
                state="thinking"
                size="sm"
                animation="float"
                message="Brainy loves sharing curious facts to make learning memorable."
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {session?.funFact ?? activity.funFact}
            </p>
          </Panel>
        </div>
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
