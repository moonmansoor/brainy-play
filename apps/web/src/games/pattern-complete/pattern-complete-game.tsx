"use client";

import Image from "next/image";
import { useState } from "react";

import { Panel } from "@/components/ui/panel";
import { ShapeToken } from "@/components/activity/shape-token";
import { buildOutcome, getShapeName } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  PatternCompleteAnswer,
  PatternCompleteConfig,
  ThemePack
} from "@/types/activity";

export function PatternCompleteGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: PatternCompleteConfig;
  answer: PatternCompleteAnswer;
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
    <div className="grid gap-6">
      <Panel className={`overflow-hidden bg-gradient-to-br ${themePack.gradient}`}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div>
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
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {config.sequence.map((step) => (
                <div
                  key={step.id}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-[1.75rem] bg-white/85"
                >
                  <div className="text-2xl">
                    {visualTheme.shapeIcons?.[step.shape] ?? "✨"}
                  </div>
                  <ShapeToken shape={step.shape} color={step.color} size="sm" />
                </div>
              ))}
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-300 bg-white/70 text-4xl">
                ?
              </div>
            </div>
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
      <div className="grid gap-4 sm:grid-cols-3">
        {config.options.map((option) => {
          const selected = option.id === selectedId;
          const correct = option.id === answer.correctOptionId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChoice(option.id)}
            >
              <Panel
                className={`flex min-h-40 flex-col items-center justify-center gap-3 border-2 ${
                  selected && correct
                    ? "border-emerald-300"
                    : selected
                      ? "border-red-300"
                      : "border-transparent"
                }`}
              >
                <div className="text-2xl">
                  {visualTheme.shapeIcons?.[option.shape] ?? "✨"}
                </div>
                <ShapeToken shape={option.shape} color={option.color} size="md" />
                <span className="font-display text-xl font-semibold">
                  {visualTheme.shapeLabels?.[option.shape] ?? getShapeName(option.shape)}
                </span>
              </Panel>
            </button>
          );
        })}
      </div>
      {selectedId && selectedId !== answer.correctOptionId && !resolved ? (
        <Panel className="bg-red-50 text-sm text-red-700">
          The pattern repeats. Follow {themePack.mascotName}&apos;s rhythm and pick the matching visual beat.
        </Panel>
      ) : null}
    </div>
  );
}
