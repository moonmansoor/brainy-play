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
  SequenceOrderAnswer,
  SequenceOrderConfig,
  ThemePack
} from "@/types/activity";

export function SequenceOrderGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: SequenceOrderConfig;
  answer: SequenceOrderAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  const shuffledSteps = useMemo(() => {
    return [...config.steps].sort((left, right) => left.id.localeCompare(right.id)).sort(() => Math.random() - 0.5);
  }, [config.steps]);

  const selectedSteps = selectedIds
    .map((id) => config.steps.find((step) => step.id === id) ?? null)
    .filter((step): step is SequenceOrderConfig["steps"][number] => Boolean(step));

  const availableSteps = shuffledSteps.filter((step) => !selectedIds.includes(step.id));

  function handleAddStep(stepId: string) {
    setFeedback("");
    setSelectedIds((current) => [...current, stepId]);
  }

  function handleReset() {
    setSelectedIds([]);
    setFeedback("");
  }

  function handleCheck() {
    if (selectedIds.length !== answer.correctOrderIds.length) return;

    const isCorrect = answer.correctOrderIds.every(
      (stepId, index) => selectedIds[index] === stepId
    );

    if (!isCorrect) {
      setMistakesCount((current) => current + 1);
      setFeedback("That story order is not right yet. Try again from the beginning.");
      setSelectedIds([]);
      return;
    }

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );

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
        <p className="font-display text-2xl font-semibold">Build the story</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {selectedSteps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-[1.5rem] bg-white p-4 text-center ring-1 ring-slate-200"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Step {index + 1}
              </p>
              <div className="mt-3 text-4xl">{step.emoji}</div>
              <p className="mt-2 font-display text-xl font-semibold">{step.label}</p>
            </div>
          ))}
          {Array.from({
            length: Math.max(0, answer.correctOrderIds.length - selectedSteps.length)
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex min-h-32 items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 text-3xl text-slate-300"
            >
              ?
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-4">
        {availableSteps.map((step) => (
          <button key={step.id} type="button" onClick={() => handleAddStep(step.id)}>
            <Panel className="flex min-h-40 flex-col items-center justify-center gap-3 border-2 border-transparent">
              <div className="text-5xl">{step.emoji}</div>
              <span className="font-display text-xl font-semibold">{step.label}</span>
            </Panel>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mistakes: <span className="font-bold">{mistakesCount}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleReset}>
            Reset order
          </Button>
          <Button
            onClick={handleCheck}
            disabled={selectedIds.length !== answer.correctOrderIds.length}
          >
            Check order
          </Button>
        </div>
      </div>

      {feedback ? (
        <Panel className="bg-red-50 text-sm text-red-700">
          <MascotBrain
            state="encouraging"
            size="sm"
            animation="float"
            message={feedback}
          />
        </Panel>
      ) : null}
    </div>
  );
}
