"use client";

import Image from "next/image";
import { useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ShapeToken } from "@/components/activity/shape-token";
import { buildOutcome, getShapeName } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  ShapeMatchAnswer,
  ShapeMatchConfig,
  ThemePack
} from "@/types/activity";

export function ShapeMatchGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: ShapeMatchConfig;
  answer: ShapeMatchAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [startedAt] = useState(() => Date.now());

  function handleChoice(optionId: string) {
    if (resolved) return;

    setSelectedId(optionId);

    if (optionId !== answer.correctOptionId) {
      setMistakesCount((current) => current + 1);
      return;
    }

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );

    setResolved(true);
    onComplete(buildOutcome(true, mistakesCount, durationSeconds));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Panel className={`overflow-hidden bg-gradient-to-br ${themePack.gradient}`}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-600">
              {visualTheme.heroTitle}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {visualTheme.heroHint}
            </p>
            {promptText ? (
              <p className="mt-4 rounded-[1.25rem] bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
                {promptText}
              </p>
            ) : null}
            <div className="mt-6 flex h-48 items-center justify-center rounded-[2rem] bg-white/75">
              <ShapeToken
                shape={config.promptShape}
                color={config.promptColor}
                size="lg"
              />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold">
              {visualTheme.shapeIcons?.[config.promptShape] ?? "✨"}{" "}
              {visualTheme.shapeLabels?.[config.promptShape] ??
                getShapeName(config.promptShape)}
            </p>
          </div>
          <div className="relative min-h-52 overflow-hidden rounded-[2rem] border border-white/60 bg-white/40">
            <Image
              src={visualTheme.imageUrl}
              alt={visualTheme.cardTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 30vw"
            />
          </div>
        </div>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        {config.options.map((option) => {
          const isSelected = option.id === selectedId;
          const isCorrect = option.id === answer.correctOptionId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChoice(option.id)}
              className="text-left"
            >
              <Panel
                className={`flex min-h-44 flex-col items-center justify-center gap-4 border-2 ${
                  isSelected && !isCorrect
                    ? "border-red-300"
                    : isSelected && isCorrect
                      ? "border-emerald-300"
                      : "border-transparent"
                }`}
              >
                <div className="text-3xl">
                  {visualTheme.shapeIcons?.[option.shape] ?? "✨"}
                </div>
                <ShapeToken shape={option.shape} color={option.color} />
                <span className="font-display text-2xl font-semibold">
                  {visualTheme.shapeLabels?.[option.shape] ?? getShapeName(option.shape)}
                </span>
              </Panel>
            </button>
          );
        })}
      </div>
      {selectedId && selectedId !== answer.correctOptionId && !resolved ? (
        <div className="lg:col-span-2">
          <Panel className="flex flex-wrap items-center justify-between gap-4 bg-red-50">
            <div>
              <p className="font-display text-2xl font-semibold">Try again</p>
              <p className="text-sm text-slate-700">
                Follow {themePack.mascotName}&apos;s hint and match the same shape.
              </p>
            </div>
            <MascotBrain
              state="encouraging"
              size="sm"
              animation="float"
              message="Brainy says look at the clue shape first, then try one more time."
            />
            <Button variant="secondary" onClick={() => setSelectedId(null)}>
              Choose another card
            </Button>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
