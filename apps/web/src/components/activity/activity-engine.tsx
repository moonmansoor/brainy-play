"use client";

import { useMemo, useState } from "react";

import { Panel } from "@/components/ui/panel";
import { CountObjectsGame } from "@/games/count-objects/count-objects-game";
import { OddOneOutGame } from "@/games/odd-one-out/odd-one-out-game";
import { PatternCompleteGame } from "@/games/pattern-complete/pattern-complete-game";
import { SequenceOrderGame } from "@/games/sequence-order/sequence-order-game";
import { ShapeMatchGame } from "@/games/shape-match/shape-match-game";
import { SortGame } from "@/games/sort-game/sort-game";
import { BRAINY_COIN_LABEL, BRAINY_COIN_RULES } from "@/lib/constants/game-economy";
import { buildSessionOutcome } from "@/lib/utils/activity";
import {
  ActivityDefinition,
  ActivityItem,
  ActivityOutcome,
  ActivityVisualTheme,
  CountObjectsAnswer,
  CountObjectsConfig,
  OddOneOutAnswer,
  OddOneOutConfig,
  PatternCompleteAnswer,
  PatternCompleteConfig,
  SequenceOrderAnswer,
  SequenceOrderConfig,
  ShapeMatchAnswer,
  ShapeMatchConfig,
  SortGameAnswer,
  SortGameConfig,
  ThemePack
} from "@/types/activity";

function renderItemGame(input: {
  activityType: ActivityDefinition["type"];
  item: ActivityItem;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const commonProps = {
    key: input.item.id,
    promptText: input.item.promptText,
    visualTheme: input.visualTheme,
    themePack: input.themePack,
    onComplete: input.onComplete
  };

  switch (input.activityType) {
    case "shape-match":
      return (
        <ShapeMatchGame
          {...commonProps}
          config={input.item.config as ShapeMatchConfig}
          answer={input.item.answer as ShapeMatchAnswer}
        />
      );
    case "count-objects":
      return (
        <CountObjectsGame
          {...commonProps}
          config={input.item.config as CountObjectsConfig}
          answer={input.item.answer as CountObjectsAnswer}
        />
      );
    case "pattern-complete":
      return (
        <PatternCompleteGame
          {...commonProps}
          config={input.item.config as PatternCompleteConfig}
          answer={input.item.answer as PatternCompleteAnswer}
        />
      );
    case "odd-one-out":
      return (
        <OddOneOutGame
          {...commonProps}
          config={input.item.config as OddOneOutConfig}
          answer={input.item.answer as OddOneOutAnswer}
        />
      );
    case "sequence-order":
      return (
        <SequenceOrderGame
          {...commonProps}
          config={input.item.config as SequenceOrderConfig}
          answer={input.item.answer as SequenceOrderAnswer}
        />
      );
    case "sort-game":
      return (
        <SortGame
          {...commonProps}
          config={input.item.config as SortGameConfig}
          answer={input.item.answer as SortGameAnswer}
        />
      );
    default:
      return (
        <Panel>
          <p className="font-display text-2xl font-semibold">
            This activity type is not playable yet.
          </p>
        </Panel>
      );
  }
}

export function ActivityEngine({
  activity,
  visualTheme,
  themePack,
  onComplete
}: {
  activity: ActivityDefinition;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const items = useMemo(
    () => [...activity.items].sort((left, right) => left.orderIndex - right.orderIndex),
    [activity.items]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<ActivityOutcome[]>([]);
  const [lastRewardCoins, setLastRewardCoins] = useState(0);

  const currentItem = items[currentIndex];

  function handleItemComplete(outcome: ActivityOutcome) {
    const nextOutcomes = [...outcomes, outcome];
    setLastRewardCoins(
      outcome.correctAnswersCount * BRAINY_COIN_RULES.correctAnswer
    );

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
      {lastRewardCoins > 0 ? (
        <Panel className="bg-gradient-to-r from-amber-100 to-orange-50">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
            Nice work
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-amber-950">
            +{lastRewardCoins} {BRAINY_COIN_LABEL}
          </p>
        </Panel>
      ) : null}
      <Panel className="flex flex-wrap items-center justify-between gap-4 bg-white/80">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
            Activity rounds
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            Question {currentIndex + 1} of {items.length}
          </h3>
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

      {renderItemGame({
        activityType: activity.type,
        item: currentItem,
        visualTheme,
        themePack,
        onComplete: handleItemComplete
      })}
    </div>
  );
}
