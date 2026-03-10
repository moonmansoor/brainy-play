"use client";

import { useEffect, useMemo, useState } from "react";

import { ActivityCard } from "@/components/activity/activity-card";
import { ThemeChip } from "@/components/activity/theme-chip";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { listActivities } from "@/features/activities/repository";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import {
  ActivityAccessState,
  evaluateActivityAccess,
  isSubscriptionActive
} from "@/features/progress/progression-rules";
import { getChildExperience } from "@/features/progress/progress-client";
import { FREE_PLAY_LEVEL_LIMIT, BRAINY_COIN_LABEL } from "@/lib/constants/game-economy";
import { themePacks } from "@/lib/constants/sample-data";
import {
  getChildAge,
  getChildThemePreferences,
  getThemeMatchScore,
  isAgeMatch
} from "@/lib/utils/activity";
import { ActivityDefinition, ChildProfile } from "@/types/activity";

type DecoratedActivity = {
  activity: ActivityDefinition;
  accessState: ActivityAccessState;
};

export function ActivityLibraryClient({
  childId
}: {
  childId?: string;
}) {
  const [activities, setActivities] = useState<ActivityDefinition[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState<Awaited<
    ReturnType<typeof getChildExperience>
  > | null>(null);

  useEffect(() => {
    async function hydrate() {
      setLoading(true);

      const nextActivities = await listActivities();
      setActivities(nextActivities.filter((item) => item.isPublished));

      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));

      if (resolved.child) {
        setExperience(await getChildExperience(resolved.child));
      } else {
        setExperience(null);
      }

      setLoading(false);
    }

    void hydrate();
  }, [childId]);

  const orderedActivities = useMemo(() => {
    if (!activeChild) return activities;
    const childAge = getChildAge(activeChild);

    return [...activities].sort((left, right) => {
      const themeDelta =
        getThemeMatchScore(right, activeChild) - getThemeMatchScore(left, activeChild);
      if (themeDelta !== 0) return themeDelta;

      const ageFitDelta =
        Number(isAgeMatch(right, childAge)) - Number(isAgeMatch(left, childAge));
      if (ageFitDelta !== 0) return ageFitDelta;

      return left.requiredLevel - right.requiredLevel;
    });
  }, [activities, activeChild]);

  const decoratedActivities = useMemo(() => {
    if (!experience) return [] as DecoratedActivity[];

    return orderedActivities.map((activity) => ({
      activity,
      accessState: evaluateActivityAccess({
        activity,
        progress: experience.progress,
        subscription: experience.subscription
      })
    }));
  }, [experience, orderedActivities]);

  if (loading) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">Loading activities...</p>
      </Panel>
    );
  }

  if (!activeChild) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">
          {authReady ? "Choose a child profile first" : "Parent login required"}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {authReady
            ? "Return to child profiles and select a learner."
            : "Sign in as a parent, then select a child profile to open the activity library."}
        </p>
        {!authReady ? (
          <div className="mt-4">
            <LinkButton href="/auth/login">Parent login</LinkButton>
          </div>
        ) : null}
      </Panel>
    );
  }

  const childAge = getChildAge(activeChild);
  const preferredThemes = getChildThemePreferences(activeChild).favoriteThemes;
  const readyToPlay = decoratedActivities.filter(
    (item) => item.accessState.isPlayable && isAgeMatch(item.activity, childAge)
  );
  const stretchActivities = decoratedActivities.filter(
    (item) => item.accessState.isPlayable && !isAgeMatch(item.activity, childAge)
  );
  const upcomingLevels = decoratedActivities.filter(
    (item) => item.accessState.status === "locked-level"
  );
  const premiumLevels = decoratedActivities.filter(
    (item) => item.accessState.status === "locked-premium"
  );
  const hasPremiumAccess = isSubscriptionActive(experience?.subscription);

  return (
    <div className="grid gap-8">
      <Panel className="overflow-hidden p-0">
        <div className="grid gap-6 bg-gradient-to-r from-white via-[#fff7ec] to-[#eef9ff] p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Personalized library
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {activeChild.displayName}&apos;s level path
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              Earn {BRAINY_COIN_LABEL} for every correct answer and keep leveling up
              through themed activities. Free play continues through level{" "}
              {FREE_PLAY_LEVEL_LIMIT}, then premium levels stay visible but locked.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Current level
                </p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {experience?.progress.currentLevel ?? 1}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  {BRAINY_COIN_LABEL}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {experience?.progress.brainyCoinsBalance ?? 0}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Access
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {hasPremiumAccess ? "Premium" : "Free"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {themePacks
              .filter((theme) => preferredThemes.includes(theme.id))
              .map((theme) => (
                <ThemeChip key={theme.id} theme={theme} active compact />
              ))}
          </div>
        </div>
      </Panel>

      {premiumLevels.length > 0 ? (
        <Panel className="border border-dashed border-amber-200 bg-amber-50/80">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
            Premium progression locked
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            Levels after {FREE_PLAY_LEVEL_LIMIT} need a subscription before they can
            be played. Locked activities stay visible so the next goal is clear.
          </p>
          <div className="mt-4">
            <LinkButton href={`/parent?childId=${activeChild.id}`} variant="secondary">
              Ask a grown-up to upgrade
            </LinkButton>
          </div>
        </Panel>
      ) : null}

      <section className="grid gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">Ready to play</h3>
          <p className="text-sm text-slate-600">
            Levels already unlocked for this learner.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {readyToPlay.map(({ activity, accessState }) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              child={activeChild}
              accessState={accessState}
            />
          ))}
        </div>
      </section>

      {stretchActivities.length > 0 ? (
        <section className="grid gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold">Stretch zone</h3>
            <p className="text-sm text-slate-600">
              Unlocked levels with a little more challenge for this age.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {stretchActivities.map(({ activity, accessState }) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                child={activeChild}
                accessState={accessState}
              />
            ))}
          </div>
        </section>
      ) : null}

      {upcomingLevels.length > 0 ? (
        <section className="grid gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold">Coming up next</h3>
            <p className="text-sm text-slate-600">
              Complete the current level path to unlock these activities.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {upcomingLevels.map(({ activity, accessState }) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                child={activeChild}
                accessState={accessState}
              />
            ))}
          </div>
        </section>
      ) : null}

      {premiumLevels.length > 0 ? (
        <section className="grid gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold">Premium levels</h3>
            <p className="text-sm text-slate-600">
              Visible, but locked until a subscription is active.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {premiumLevels.map(({ activity, accessState }) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                child={activeChild}
                accessState={accessState}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
