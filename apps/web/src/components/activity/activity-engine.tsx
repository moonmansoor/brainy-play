"use client";

import { useMemo, useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  getActivityInteractionLabel
} from "@/features/activities/template-registry";
import { renderActivityItemGame } from "@/features/activities/activity-renderers";
import { buildSessionOutcome, formatDuration } from "@/lib/utils/activity";
import {
  ActivityDefinition,
  ActivityOutcome,
  ThemePack
} from "@/types/activity";

export function ActivityEngine({
  activity,
  items: providedItems,
  levelLabel,
  focusLabel,
  visualTheme,
  themePack,
  onComplete
}: {
  activity: ActivityDefinition;
  items?: ActivityDefinition["items"];
  levelLabel?: string;
  focusLabel?: string;
  visualTheme: ActivityDefinition["visualThemes"][number];
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const items = useMemo(
    () =>
      [...(providedItems ?? activity.items)].sort(
        (left, right) => left.orderIndex - right.orderIndex
      ),
    [activity.items, providedItems]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<ActivityOutcome[]>([]);
  const [pendingOutcome, setPendingOutcome] = useState<ActivityOutcome | null>(null);

  const currentItem = items[currentIndex];

  function handleItemComplete(outcome: ActivityOutcome) {
    setPendingOutcome(outcome);
  }

  function handleContinue() {
    if (!pendingOutcome) return;

    const nextOutcomes = [...outcomes, pendingOutcome];
    setPendingOutcome(null);

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
            {levelLabel ? `${levelLabel} • ` : ""}
            {focusLabel ? `${focusLabel} • ` : ""}
            {getActivityInteractionLabel(activity.interactionType)} • {activity.learningAreas.join(", ")}
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

      {pendingOutcome ? (
        <Panel className="overflow-hidden bg-gradient-to-r from-emerald-100 via-white to-sky-50">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Question result
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-slate-900">
                {pendingOutcome.isCorrect ? "Correct! Great job!" : "Nice try!"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {pendingOutcome.isCorrect
                  ? "You solved this question. Tap next when you are ready for the next challenge."
                  : "You finished this question. Tap next to keep practicing."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  Score {pendingOutcome.score}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {pendingOutcome.starsEarned} star{pendingOutcome.starsEarned === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {pendingOutcome.mistakesCount} mistake{pendingOutcome.mistakesCount === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {formatDuration(pendingOutcome.durationSeconds)}
                </span>
              </div>
              <div className="mt-5">
                <Button onClick={handleContinue}>
                  {currentIndex >= items.length - 1 ? "Finish activity" : "Next question"}
                </Button>
              </div>
            </div>
            <MascotBrain
              state={pendingOutcome.isCorrect ? "celebrating" : "encouraging"}
              animation={pendingOutcome.isCorrect ? "bounce" : "float"}
              size="md"
              message={
                pendingOutcome.isCorrect
                  ? "Brainy is celebrating your correct answer."
                  : "Brainy is cheering you on for the next question."
              }
              reverse
            />
          </div>
        </Panel>
      ) : (
        renderActivityItemGame(activity.type, {
          item: currentItem,
          visualTheme,
          themePack,
          onComplete: handleItemComplete
        })
      )}
    </div>
  );
}
