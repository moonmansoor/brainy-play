"use client";

import Image from "next/image";
import { DragEvent, useMemo, useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildOutcome } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  ConnectLogicAnswer,
  ConnectLogicConfig,
  ThemePack
} from "@/types/activity";

export function ConnectLogicGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: ConnectLogicConfig;
  answer: ConnectLogicAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const placedTargetByPromptId = useMemo(
    () =>
      Object.entries(placements).reduce<Record<string, string>>((result, [targetId, promptId]) => {
        result[promptId] = targetId;
        return result;
      }, {}),
    [placements]
  );

  const availablePrompts = config.prompts.filter((prompt) => !placedTargetByPromptId[prompt.id]);

  function evaluatePlacements(nextPlacements: Record<string, string>) {
    if (Object.keys(nextPlacements).length !== config.prompts.length) return;

    const isCorrect = Object.entries(answer.correctMatches).every(
      ([promptId, correctTargetId]) => nextPlacements[correctTargetId] === promptId
    );

    if (!isCorrect) {
      setMistakesCount((current) => current + 1);
      setFeedback("Some homes do not match yet. Try dragging the friends again.");
      setPlacements({});
      setSelectedPromptId(null);
      setActiveDropTargetId(null);
      return;
    }

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );
    onComplete(buildOutcome(true, mistakesCount, durationSeconds));
  }

  function assignPromptToTarget(promptId: string, targetId: string) {
    const nextPlacements = Object.entries(placements).reduce<Record<string, string>>(
      (result, [existingTargetId, existingPromptId]) => {
        if (existingTargetId === targetId) return result;
        if (existingPromptId === promptId) return result;
        result[existingTargetId] = existingPromptId;
        return result;
      },
      {}
    );

    nextPlacements[targetId] = promptId;
    setPlacements(nextPlacements);
    setSelectedPromptId(null);
    setFeedback("");
    setActiveDropTargetId(null);
    evaluatePlacements(nextPlacements);
  }

  function handleTargetTap(targetId: string) {
    if (!selectedPromptId) return;
    assignPromptToTarget(selectedPromptId, targetId);
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, promptId: string) {
    event.dataTransfer.setData("text/plain", promptId);
    event.dataTransfer.effectAllowed = "move";
    setSelectedPromptId(promptId);
    setFeedback("");
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, targetId: string) {
    event.preventDefault();
    const promptId = event.dataTransfer.getData("text/plain") || selectedPromptId;
    if (!promptId) return;
    assignPromptToTarget(promptId, targetId);
  }

  function clearPlacements() {
    setPlacements({});
    setSelectedPromptId(null);
    setActiveDropTargetId(null);
    setFeedback("");
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
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Drag each garden friend into the matching home. On touch screens, tap a friend first and then tap its home.
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

      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Garden friends
            </p>
            {availablePrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => setSelectedPromptId(prompt.id)}
                draggable
                onDragStart={(event) => handleDragStart(event, prompt.id)}
                className="block w-full"
              >
                <Panel
                  className={`flex min-h-24 items-center gap-3 border-2 ${
                    selectedPromptId === prompt.id
                      ? "border-orange-300"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: `${prompt.color}22` }}
                >
                  <span className="text-3xl">{prompt.emoji}</span>
                  <div className="text-left">
                    <p className="font-semibold">{prompt.label}</p>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Drag to a home
                    </p>
                  </div>
                </Panel>
              </button>
            ))}
            {availablePrompts.length === 0 ? (
              <Panel className="flex min-h-24 items-center justify-center border border-dashed border-emerald-200 bg-emerald-50/70 text-sm font-semibold text-emerald-700">
                All friends have been placed.
              </Panel>
            ) : null}
          </div>

          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Matching homes
            </p>
            {config.targets.map((target) => {
              const placedPrompt = config.prompts.find(
                (item) => item.id === placements[target.id]
              );

              return (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => handleTargetTap(target.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setActiveDropTargetId(target.id);
                  }}
                  onDragLeave={() =>
                    setActiveDropTargetId((current) => (current === target.id ? null : current))
                  }
                  onDrop={(event) => handleDrop(event, target.id)}
                  className="block w-full"
                >
                  <Panel
                    className={`flex min-h-28 items-center justify-between gap-3 border-2 transition ${
                      activeDropTargetId === target.id
                        ? "border-orange-300"
                        : placements[target.id]
                          ? "border-emerald-300"
                          : "border-dashed border-slate-200"
                    }`}
                    style={{ backgroundColor: `${target.color}22` }}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-3xl">{target.emoji}</span>
                      <div>
                        <p className="font-semibold">{target.label}</p>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                          {placements[target.id] ? "Matched home" : "Drop friend here"}
                        </p>
                      </div>
                    </div>
                    {placedPrompt ? (
                      <div className="rounded-[1.25rem] bg-white/85 px-4 py-3 text-left ring-1 ring-white/70">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{placedPrompt.emoji}</span>
                          <div>
                            <p className="font-semibold text-slate-800">{placedPrompt.label}</p>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              In place
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </Panel>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Panel className="bg-white/80">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
          Current links
        </p>
        <div className="mt-3 grid gap-2">
          {Object.entries(placements).length === 0 ? (
            <p className="text-sm text-slate-600">Drag a friend into the matching home.</p>
          ) : (
            Object.entries(placements).map(([targetId, promptId]) => {
              const prompt = config.prompts.find((item) => item.id === promptId);
              const target = config.targets.find((item) => item.id === targetId);
              return (
                <div key={`${promptId}:${targetId}`} className="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                  {prompt?.emoji} {prompt?.label} → {target?.emoji} {target?.label}
                </div>
              );
            })
          )}
        </div>
        {Object.keys(placements).length > 0 ? (
          <div className="mt-4">
            <Button variant="secondary" onClick={clearPlacements}>
              Reset matches
            </Button>
          </div>
        ) : null}
      </Panel>

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
