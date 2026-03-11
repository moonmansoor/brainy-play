"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildOutcome } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  CountObjectsAnswer,
  CountObjectsConfig,
  ThemePack
} from "@/types/activity";

export function CountObjectsGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: CountObjectsConfig;
  answer: CountObjectsAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const objects = useMemo(
    () => Array.from({ length: config.count }, (_, index) => `${index}`),
    [config.count]
  );

  function handleSubmit() {
    if (selectedCount === null || resolved) return;

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );

    if (selectedCount !== answer.correctCount) {
      setMistakesCount((current) => current + 1);
      return;
    }

    setResolved(true);
    onComplete(buildOutcome(true, mistakesCount, durationSeconds));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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
            <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5">
              {objects.map((item) => (
                <div
                  key={item}
                  className="flex h-20 items-center justify-center rounded-[1.5rem] bg-white/85 text-4xl shadow-sm"
                >
                  {visualTheme.objectEmoji ?? "⭐"}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-700">
              How many {visualTheme.objectLabel ?? "objects"} can you see?
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
      <Panel>
        <p className="font-display text-2xl font-semibold">Pick a number</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {config.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedCount(option)}
              className={`min-h-24 rounded-[1.5rem] text-3xl font-bold transition ${
                selectedCount === option
                  ? "text-white"
                  : "bg-orange-100 text-orange-900"
              }`}
              style={
                selectedCount === option
                  ? { backgroundColor: themePack.accentStrong }
                  : undefined
              }
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Mistakes: <span className="font-bold">{mistakesCount}</span>
          </p>
          <Button onClick={handleSubmit}>Check answer</Button>
        </div>
        {selectedCount !== null && selectedCount !== answer.correctCount && !resolved ? (
          <Panel className="mt-4 bg-red-50">
            <MascotBrain
              state="encouraging"
              size="sm"
              animation="float"
              message={`Count one more time with ${themePack.mascotName}. Brainy says point to each object once.`}
            />
          </Panel>
        ) : null}
      </Panel>
    </div>
  );
}
