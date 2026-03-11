"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { ShapeToken } from "@/components/activity/shape-token";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildOutcome } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  SortGameAnswer,
  SortGameConfig,
  ThemePack
} from "@/types/activity";

export function SortGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: SortGameConfig;
  answer: SortGameAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  const allPlaced = useMemo(
    () => config.options.every((option) => placements[option.id]),
    [config.options, placements]
  );

  function placeInGroup(groupId: string) {
    if (!selectedOptionId) return;

    setPlacements((current) => ({
      ...current,
      [selectedOptionId]: groupId
    }));
    setSelectedOptionId(null);
    setFeedback("");
  }

  function handleCheck() {
    const wrongOptionIds = config.options
      .filter((option) => placements[option.id] !== answer.correctGroups[option.id])
      .map((option) => option.id);

    if (wrongOptionIds.length > 0) {
      setMistakesCount((current) => current + 1);
      setFeedback("Some tokens are in the wrong group. Try moving those again.");
      setPlacements((current) => {
        const next = { ...current };
        for (const optionId of wrongOptionIds) {
          delete next[optionId];
        }
        return next;
      });
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
        <p className="font-display text-2xl font-semibold">Choose a token to sort</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {config.options.map((option) => {
            const placedGroupId = placements[option.id];
            const isSelected = option.id === selectedOptionId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                className="text-left"
              >
                <Panel
                  className={`flex min-h-36 flex-col items-center justify-center gap-3 border-2 ${
                    isSelected ? "border-orange-300" : "border-transparent"
                  }`}
                >
                  {option.shape ? (
                    <ShapeToken shape={option.shape} color={option.color} size="md" />
                  ) : (
                    <div className="text-5xl">{option.emoji}</div>
                  )}
                  <span className="font-display text-xl font-semibold">{option.label}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {placedGroupId
                      ? `In ${config.groups.find((group) => group.id === placedGroupId)?.label}`
                      : "Not sorted yet"}
                  </span>
                </Panel>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {config.groups.map((group) => (
          <button key={group.id} type="button" onClick={() => placeInGroup(group.id)}>
            <Panel
              className="min-h-44 border-2 border-dashed"
              style={{ borderColor: group.color, backgroundColor: `${group.color}33` }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                {group.emoji} {group.label}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {config.options
                  .filter((option) => placements[option.id] === group.id)
                  .map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </div>
                  ))}
              </div>
            </Panel>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mistakes: <span className="font-bold">{mistakesCount}</span>
        </p>
        <Button onClick={handleCheck} disabled={!allPlaced}>
          Check sorting
        </Button>
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
