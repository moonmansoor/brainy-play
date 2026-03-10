"use client";

import { useEffect, useMemo, useState } from "react";

import { ActivityCard } from "@/components/activity/activity-card";
import { ThemeChip } from "@/components/activity/theme-chip";
import { Panel } from "@/components/ui/panel";
import { listActivities } from "@/features/activities/repository";
import { resolveActiveChild } from "@/features/child-profiles/child-session-client";
import { themePacks } from "@/lib/constants/sample-data";
import {
  getChildAge,
  getChildThemePreferences,
  getThemeMatchScore,
  isAgeMatch
} from "@/lib/utils/activity";
import { ActivityDefinition, ChildProfile } from "@/types/activity";

export function ActivityLibraryClient({
  childId
}: {
  childId?: string;
}) {
  const [activities, setActivities] = useState<ActivityDefinition[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      setLoading(true);

      const nextActivities = await listActivities();
      setActivities(nextActivities.filter((item) => item.isPublished));

      const resolved = await resolveActiveChild(childId);
      setActiveChild(resolved.child);
      setAuthReady(Boolean(resolved.user));
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

      return left.difficulty - right.difficulty;
    });
  }, [activities, activeChild]);

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
            <a
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff8b5f] to-[#ff6e70] px-5 py-3 text-sm font-bold text-white shadow-playful"
            >
              Parent login
            </a>
          </div>
        ) : null}
      </Panel>
    );
  }

  const childAge = getChildAge(activeChild);
  const ready = orderedActivities.filter((activity) => isAgeMatch(activity, childAge));
  const stretch = orderedActivities.filter((activity) => !isAgeMatch(activity, childAge));
  const preferredThemes = getChildThemePreferences(activeChild).favoriteThemes;

  return (
    <div className="grid gap-8">
      <Panel className="overflow-hidden p-0">
        <div className="grid gap-6 bg-gradient-to-r from-white via-[#fff7ec] to-[#eef9ff] p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
              Personalized library
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {activeChild.displayName}&apos;s themed activity library
            </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              The library now loads multi-question activities from the content
              layer, then prioritizes visual packs that match favorite interests
              first. Each card can grow into richer question sets without
              changing the child-facing experience.
            </p>
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

      <section className="grid gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">Recommended first</h3>
          <p className="text-sm text-slate-600">
            Best match for current age and favorite themes.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {ready.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} child={activeChild} />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">Stretch zone</h3>
          <p className="text-sm text-slate-600">
            Same playful themes with a little more challenge.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {stretch.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} child={activeChild} />
          ))}
        </div>
      </section>
    </div>
  );
}
