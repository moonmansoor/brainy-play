"use client";

import { useMemo, useState } from "react";

import { Panel } from "@/components/ui/panel";
import {
  getActivityInteractionLabel
} from "@/features/activities/template-registry";
import { renderActivityItemGame } from "@/features/activities/activity-renderers";
import { buildSessionOutcome } from "@/lib/utils/activity";
import {
  ActivityDefinition,
  ActivityOutcome,
  ThemePack
} from "@/types/activity";

export function ActivityEngine({
  activity,
  visualTheme,
  themePack,
  onComplete
}: {
  activity: ActivityDefinition;
  visualTheme: ActivityDefinition["visualThemes"][number];
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const items = useMemo(
    () => [...activity.items].sort((left, right) => left.orderIndex - right.orderIndex),
    [activity.items]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<ActivityOutcome[]>([]);

  const currentItem = items[currentIndex];

  function handleItemComplete(outcome: ActivityOutcome) {
    const nextOutcomes = [...outcomes, outcome];

    if (currentIndex >= items.length - 1) {
      onComplete(buildSessionOutcome(nextOutcomes));
      return;
    }

    setOutcomes(nextOutcomes);
    setCurrentIndex((index) => index + 1);
  }

  if (!currentItem) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">
          No activity items are available yet.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6">
      <Panel className="flex flex-wrap items-center justify-between gap-4 bg-white/80">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Activity rounds
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            Question {currentIndex + 1} of {items.length}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {getActivityInteractionLabel(activity.interactionType)} •{" "}
            {activity.learningAreas.join(", ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={item.id}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                index < currentIndex
                  ? "bg-emerald-500 text-white"
                  : index === currentIndex
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </Panel>

      {renderActivityItemGame(activity.type, {
        item: currentItem,
        visualTheme,
        themePack,
        onComplete: handleItemComplete
      })}
    </div>
  );
}
