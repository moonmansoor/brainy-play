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
  CodeBlocksAnswer,
  CodeBlocksConfig,
  ThemePack
} from "@/types/activity";

export function CodeBlocksGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: CodeBlocksConfig;
  answer: CodeBlocksAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  const selectedBlocks = useMemo(
    () =>
      selectedIds
        .map((id) => config.blocks.find((block) => block.id === id) ?? null)
        .filter(Boolean),
    [config.blocks, selectedIds]
  );
  const availableBlocks = config.blocks.filter((block) => !selectedIds.includes(block.id));

  function handleCheck() {
    if (selectedIds.length !== answer.correctOrderIds.length) return;

    const isCorrect = answer.correctOrderIds.every(
      (blockId, index) => selectedIds[index] === blockId
    );

    if (!isCorrect) {
      setMistakesCount((current) => current + 1);
      setFeedback("That program order is not quite right. Try building it again.");
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
            <p className="mt-4 text-sm font-semibold text-slate-700">{config.prompt}</p>
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
        <p className="font-display text-2xl font-semibold">Build the program</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {selectedBlocks.map((block, index) => (
            <div
              key={block?.id}
              className="rounded-[1.5rem] px-4 py-5 text-center text-white"
              style={{ backgroundColor: block?.color }}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
                Step {index + 1}
              </p>
              <div className="mt-3 text-4xl">{block?.emoji ?? "⬜"}</div>
              <p className="mt-2 font-display text-xl font-semibold">{block?.label}</p>
            </div>
          ))}
          {Array.from({
            length: Math.max(0, answer.correctOrderIds.length - selectedBlocks.length)
          }).map((_, index) => (
            <div
              key={`slot-${index}`}
              className="flex min-h-32 items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 text-3xl text-slate-300"
            >
              +
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-4">
        {availableBlocks.map((block) => (
          <button key={block.id} type="button" onClick={() => setSelectedIds((current) => [...current, block.id])}>
            <Panel className="flex min-h-36 flex-col items-center justify-center gap-3 border-2 border-transparent">
              <div className="rounded-full px-4 py-2 text-3xl text-white" style={{ backgroundColor: block.color }}>
                {block.emoji ?? "⬜"}
              </div>
              <span className="font-display text-xl font-semibold">{block.label}</span>
            </Panel>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mistakes: <span className="font-bold">{mistakesCount}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setSelectedIds([])}>
            Reset blocks
          </Button>
          <Button onClick={handleCheck} disabled={selectedIds.length !== answer.correctOrderIds.length}>
            Run program
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
