"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { AppShell } from "@/components/layout/app-shell";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getPrimarySkillArea, getSkillAreaLabel } from "@/features/adaptive-learning/skill-taxonomy";
import { listActivities } from "@/features/activities/repository";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import { listChildAttempts } from "@/features/child-profiles/child-profiles-client";
import { buildChildSnapshot } from "@/features/progress/progress-utils";
import {
  sampleActivities,
  sampleAttempts,
  sampleBadges,
  sampleChildren
} from "@/lib/constants/sample-data";
import {
  formatDifficulty,
  formatDuration,
  getActivityTypeLabel,
  getActivityVisualTheme,
  getChildThemePreferences,
  getThemePack
} from "@/lib/utils/activity";
import { loadStoredAttempts } from "@/lib/utils/storage";
import {
  ActivityAttempt,
  ActivityDefinition,
  ChildProfile
} from "@/types/activity";

function sortAttempts(attempts: ActivityAttempt[]) {
  return [...attempts].sort(
    (left, right) =>
      new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime()
  );
}

function pickCurrentActivity(
  activities: ActivityDefinition[],
  snapshot: ReturnType<typeof buildChildSnapshot>,
  attempts: ActivityAttempt[]
) {
  const latestAttempt = sortAttempts(attempts)[0];
  if (latestAttempt) {
    const matched = activities.find((activity) => activity.id === latestAttempt.activityId);
    if (matched) return matched;
  }

  return snapshot.recommended[0] ?? activities[0] ?? null;
}

function buildAssistantMessage(
  child: ChildProfile,
  snapshot: ReturnType<typeof buildChildSnapshot>,
  currentActivity: ActivityDefinition | null,
  hasRealChild: boolean
) {
  const strongestSkill = snapshot.strengths[0];
  const skillLabel = strongestSkill
    ? getSkillAreaLabel(strongestSkill.skillArea).toLowerCase()
    : "patterns";
  const nextChallenge = currentActivity
    ? getActivityTypeLabel(currentActivity.type).toLowerCase()
    : "a new puzzle";

  if (!hasRealChild) {
    return `Brainy says: You are strong at ${skillLabel}. Let us try ${nextChallenge} today.`;
  }

  return `Brainy says: ${child.displayName}, you are strong at ${skillLabel}. Let us jump back into ${nextChallenge}.`;
}

function buildHomeState(
  child: ChildProfile,
  activities: ActivityDefinition[],
  attempts: ActivityAttempt[],
  hasRealChild: boolean
) {
  const snapshot = buildChildSnapshot(child, attempts, activities);
  const currentActivity = pickCurrentActivity(activities, snapshot, attempts);
  const latestAttempt = sortAttempts(attempts)[0] ?? null;

  return {
    child,
    activities,
    attempts,
    snapshot,
    currentActivity,
    latestAttempt,
    hasRealChild
  };
}

const demoChild = sampleChildren[0];
const demoActivities = sampleActivities.filter((activity) => activity.isPublished);
const demoAttempts = sortAttempts(
  sampleAttempts.filter((attempt) => attempt.childId === demoChild.id)
);
const defaultHomeState = {
  loading: true,
  ...buildHomeState(demoChild, demoActivities, demoAttempts, false)
};

function HomeMetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

function SkillMeter({
  label,
  value,
  tone,
  note
}: {
  label: string;
  value: number;
  tone: "strength" | "support";
  note: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] p-4 ${
        tone === "strength" ? "bg-emerald-50/90" : "bg-amber-50/90"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm font-bold text-slate-600">{value}%</p>
      </div>
      <div className="mt-3 h-3 rounded-full bg-white/80">
        <div
          className={`h-3 rounded-full ${
            tone === "strength" ? "bg-emerald-400" : "bg-amber-400"
          }`}
          style={{ width: `${Math.max(value, 8)}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function HomeActivityCard({
  activity,
  child,
  href,
  actionLabel
}: {
  activity: ActivityDefinition;
  child: ChildProfile;
  href: string;
  actionLabel: string;
}) {
  const visualTheme = getActivityVisualTheme(activity, child);
  const themePack = getThemePack(visualTheme.themeId);
  const primarySkill = getPrimarySkillArea(activity);

  return (
    <Link href={href} className="block h-full">
      <Panel className="group h-full overflow-hidden p-0 transition duration-200 hover:-translate-y-1">
        <div className={`relative bg-gradient-to-br ${themePack.gradient} p-5`}>
          <div className="absolute inset-0 bg-confetti opacity-35" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="max-w-[72%]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700/70">
                {themePack.sticker} {getActivityTypeLabel(activity.type)}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                {visualTheme.cardTitle}
              </h3>
            </div>
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/70">
              {formatDifficulty(activity.difficulty)}
            </span>
          </div>
          <p className="relative mt-3 text-sm leading-6 text-slate-700">
            {visualTheme.cardBlurb}
          </p>
          <div className="relative mt-4 h-40 overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/55">
            <Image
              src={visualTheme.imageUrl}
              alt={visualTheme.cardTitle}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              {getSkillAreaLabel(primarySkill)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              Ages {activity.ageMin}-{activity.ageMax}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {activity.instructionsText}
          </p>
          <div className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-orange-500">
            {actionLabel}
          </div>
        </div>
      </Panel>
    </Link>
  );
}

export function HomeLandingClient() {
  const [homeState, setHomeState] = useState(defaultHomeState);

  useEffect(() => {
    let active = true;

    async function hydrateHome() {
      try {
        const [activityCatalog, resolvedChild] = await Promise.all([
          listActivities(),
          resolveActiveChild()
        ]);

        const activities = activityCatalog.filter((activity) => activity.isPublished);

        if (resolvedChild.child) {
          const localAttempts = loadStoredAttempts().filter(
            (attempt) => attempt.childId === resolvedChild.child?.id
          );
          let remoteAttempts: ActivityAttempt[] = [];

          try {
            remoteAttempts = await listChildAttempts(resolvedChild.child.id);
          } catch {
            remoteAttempts = [];
          }

          if (!active) return;

          setHomeState({
            ...buildHomeState(
              resolvedChild.child,
              activities,
              sortAttempts([...localAttempts, ...remoteAttempts]),
              true
            ),
            loading: false
          });
          return;
        }

        if (!active) return;

        setHomeState({
          ...buildHomeState(
            demoChild,
            activities.length ? activities : demoActivities,
            demoAttempts,
            false
          ),
          loading: false
        });
      } catch {
        if (!active) return;
        setHomeState({
          ...buildHomeState(demoChild, demoActivities, demoAttempts, false),
          loading: false
        });
      }
    }

    void hydrateHome();

    return () => {
      active = false;
    };
  }, []);

  const { child, snapshot, currentActivity, latestAttempt, hasRealChild, loading } =
    homeState;
  const fallbackActivity = currentActivity ?? homeState.activities[0] ?? demoActivities[0];
  const focusSkill =
    snapshot.activePracticeFocus ?? snapshot.weakAreas[0] ?? snapshot.strengths[0];
  const progressPercent = Math.max(
    focusSkill?.masteryScore ?? snapshot.averageSuccessRate,
    hasRealChild ? 12 : 68
  );
  const resumeHref =
    hasRealChild && fallbackActivity
      ? `/child/activities/${fallbackActivity.slug}?childId=${child.id}`
      : "/child/activities";
  const currentVisualTheme = getActivityVisualTheme(fallbackActivity, child);
  const currentThemePack = getThemePack(currentVisualTheme.themeId);
  const preferredThemes = getChildThemePreferences(child).favoriteThemes
    .map((themeId) => getThemePack(themeId))
    .slice(0, 3);
  const recommendedIds = new Set(snapshot.recommended.map((activity) => activity.id));
  const libraryActivities = [
    ...snapshot.recommended,
    ...homeState.activities.filter((activity) => !recommendedIds.has(activity.id))
  ].slice(0, 6);
  const assistantMessage = buildAssistantMessage(
    child,
    snapshot,
    fallbackActivity,
    hasRealChild
  );
  const heroHeading = hasRealChild
    ? `Welcome back, ${child.displayName}. Your next challenge is ready.`
    : "Welcome to Brainy Play, a colorful learning hub for curious kids.";
  const heroSubheading = hasRealChild
    ? `${snapshot.currentPracticeReason} Resume ${fallbackActivity.title.toLowerCase()} to keep stars, badges, and confidence growing.`
    : "Start with matching, mazes, patterns, and logic play. Brainy Play suggests what to try next so the homepage feels like a launchpad, not an empty dashboard.";
  const achievementCards = [
    {
      ...sampleBadges[0],
      earned: snapshot.totalStars > 0,
      statusLabel: snapshot.totalStars > 0 ? "Earned" : "Almost there"
    },
    {
      ...sampleBadges[1],
      earned:
        getChildThemePreferences(child).favoriteThemes.length > 1 ||
        snapshot.totalAttempts >= 3,
      statusLabel:
        getChildThemePreferences(child).favoriteThemes.length > 1 ||
        snapshot.totalAttempts >= 3
          ? "Earned"
          : "Try more worlds"
    }
  ];
  const funFact =
    latestAttempt?.funFact ?? fallbackActivity.funFact ?? "Every puzzle helps your brain build stronger pathways.";

  return (
    <>
      <AppShell
        heading={heroHeading}
        subheading={heroSubheading}
        mascotState={hasRealChild ? "excited" : "teaching"}
        mascotAnimation={hasRealChild ? "sparkle" : "float"}
        mascotMessage={assistantMessage}
        actions={
          <>
            <LinkButton href={resumeHref}>Start learning</LinkButton>
            <LinkButton href="/child/activities" variant="secondary">
              Browse activities
            </LinkButton>
            <LinkButton
              href={hasRealChild ? "/dashboard" : "/auth/login"}
              variant="ghost"
            >
              {hasRealChild ? "View dashboard" : "Parent login"}
            </LinkButton>
          </>
        }
      >
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Panel className="overflow-hidden p-0">
            <div
              className={`grid gap-6 bg-gradient-to-br ${currentThemePack.gradient} p-6 lg:grid-cols-[1fr_0.9fr]`}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-600">
                  Continue learning
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                  <span className="rounded-full bg-white/80 px-4 py-2">
                    {loading ? "Loading learner data" : hasRealChild ? "Live learner view" : "Preview mode"}
                  </span>
                  <span className="rounded-full bg-white/80 px-4 py-2">
                    {snapshot.overallLevelLabel}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                  {fallbackActivity.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
                  {snapshot.currentPracticeReason}
                </p>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                    <span>
                      {focusSkill
                        ? `${getSkillAreaLabel(focusSkill.skillArea)} progress`
                        : "Learning progress"}
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-white/70">
                    <div
                      className="h-3 rounded-full bg-slate-900"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700">
                    {getActivityTypeLabel(fallbackActivity.type)}
                  </span>
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700">
                    {formatDifficulty(fallbackActivity.difficulty)}
                  </span>
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700">
                    {snapshot.totalStars} stars earned
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <LinkButton href={resumeHref}>
                    {hasRealChild ? "Quick resume" : "Open learning hub"}
                  </LinkButton>
                  <LinkButton href="/child/activities" variant="secondary">
                    See full library
                  </LinkButton>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.75rem] border border-white/70 bg-white/65 p-4">
                  <div className="relative h-48 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/50">
                    <Image
                      src={currentVisualTheme.imageUrl}
                      alt={currentVisualTheme.cardTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Current activity
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-slate-900">
                    {currentVisualTheme.cardTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {currentVisualTheme.cardBlurb}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <HomeMetricCard
                    label="Activities"
                    value={`${snapshot.totalAttempts}`}
                    hint="Completed challenges in this learner journey."
                  />
                  <HomeMetricCard
                    label="Play time"
                    value={snapshot.totalTimeLabel}
                    hint="Short bursts keep practice playful and focused."
                  />
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel className="bg-white/80">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Today&apos;s focus
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">
                {focusSkill ? getSkillAreaLabel(focusSkill.skillArea) : "Playful confidence"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {focusSkill?.nextGoal ??
                  "Pick one colorful challenge and Brainy Play will guide the next step."}
              </p>
              <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  {latestAttempt
                    ? `Last session: ${formatDuration(latestAttempt.durationSeconds)} with ${latestAttempt.starsEarned} stars`
                    : "Fresh start: Brainy has a new activity waiting."}
                </p>
              </div>
            </Panel>

            <Panel className="bg-gradient-to-br from-[#eef8ff] to-[#fff6df]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Favorite worlds
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {preferredThemes.map((theme) => (
                  <span
                    key={theme.id}
                    className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    {theme.sticker} {theme.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                {child.progressSummary ??
                  `${child.displayName} is building confidence through short, colorful challenges.`}
              </p>
            </Panel>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Activity library
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
                Pick a playful challenge
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Large, visual activity cards help kids jump straight into learning with clear next steps and friendly themes.
              </p>
            </div>
            <LinkButton href="/child/activities" variant="secondary">
              View all activities
            </LinkButton>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {libraryActivities.map((activity, index) => (
              <HomeActivityCard
                key={activity.id}
                activity={activity}
                child={child}
                href={
                  hasRealChild
                    ? `/child/activities/${activity.slug}?childId=${child.id}`
                    : "/child/activities"
                }
                actionLabel={index === 0 && hasRealChild ? "Resume now" : "Open challenge"}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel className="bg-white/80">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
              Skill progress
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
              Strongest skills
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Celebrate what is going well so the learner feels momentum right away.
            </p>
            <div className="mt-5 grid gap-3">
              {snapshot.strengths.slice(0, 3).map((item) => (
                <SkillMeter
                  key={item.skillArea}
                  label={getSkillAreaLabel(item.skillArea)}
                  value={item.masteryScore}
                  tone="strength"
                  note={item.positiveSummary}
                />
              ))}
            </div>
          </Panel>

          <Panel className="bg-white/80">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
              Skill progress
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
              Needs a little support
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gentle guidance helps Brainy Play point to the next skill worth practicing.
            </p>
            <div className="mt-5 grid gap-3">
              {snapshot.weakAreas.slice(0, 3).map((item) => (
                <SkillMeter
                  key={item.skillArea}
                  label={getSkillAreaLabel(item.skillArea)}
                  value={item.masteryScore}
                  tone="support"
                  note={item.nextGoal}
                />
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="bg-gradient-to-br from-[#fff7dc] via-[#fffdf8] to-[#ffe9ef]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Achievements
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
              Reward shelf
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Small wins stay visible so each session feels meaningful and motivating.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HomeMetricCard
                label="Stars"
                value={`${snapshot.totalStars}`}
                hint="Collected from successful activity rounds."
              />
              <HomeMetricCard
                label="Success rate"
                value={`${snapshot.averageSuccessRate}%`}
                hint="Average score across recent learning sessions."
              />
              <HomeMetricCard
                label="Level"
                value={`${snapshot.overallLevel}`}
                hint="Overall learning level across practiced skills."
              />
            </div>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            {achievementCards.map((badge) => (
              <Panel
                key={badge.id}
                className={`border ${
                  badge.earned
                    ? "border-emerald-200 bg-white/85"
                    : "border-slate-200 bg-slate-50/90"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-white shadow-sm">
                    <Image
                      src={badge.imageUrl ?? "/images/rewards/star-burst.svg"}
                      alt={badge.title}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      {badge.statusLabel}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                      {badge.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {badge.description}
                    </p>
                  </div>
                </div>
              </Panel>
            ))}

            <Panel className="bg-gradient-to-br from-[#eff9ff] to-[#f7ffef]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Next reward
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                Unlock a bigger challenge
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Finish one more focused activity to keep the reward loop going and uncover the next badge.
              </p>
              <div className="mt-5 h-3 rounded-full bg-white/80">
                <div
                  className="h-3 rounded-full bg-sky-400"
                  style={{ width: `${Math.min(100, snapshot.averageSuccessRate || 24)}%` }}
                />
              </div>
            </Panel>

            <Panel className="bg-gradient-to-br from-[#fff2f5] to-[#f6f4ff]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Reward style
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
                {getChildThemePreferences(child).preferredRewardStyle === "badges"
                  ? "Badge power"
                  : getChildThemePreferences(child).preferredRewardStyle === "stickers"
                    ? "Sticker party"
                    : "Sparkle burst"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Rewards match the learner&apos;s preferred style so progress feels personal and fun.
              </p>
            </Panel>
          </div>
        </section>

        <section>
          <Panel className="overflow-hidden bg-gradient-to-r from-[#ecf8ff] via-white to-[#fff4de]">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                  Brainy fun fact
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
                  Did you know?
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
                  {funFact}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Brainy uses fun facts like this to make each activity feel like a tiny discovery, not just another task.
                </p>
                <div className="mt-6">
                  <LinkButton href={resumeHref}>Try the next activity</LinkButton>
                </div>
              </div>
              <MascotBrain
                state="thinking"
                animation="float"
                size="lg"
                message="Can you spot this idea in the next puzzle?"
                reverse
                className="justify-self-start lg:justify-self-end"
              />
            </div>
          </Panel>
        </section>
      </AppShell>

      <div className="fixed bottom-5 right-5 z-30 hidden xl:block">
        <Panel className="border-orange-200/80 bg-white/92 p-4 shadow-[0_18px_55px_rgba(16,33,58,0.2)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Brainy assistant
          </p>
          <div className="mt-3">
            <MascotBrain
              state="excited"
              size="sm"
              animation="float"
              message={assistantMessage}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}
