"use client";

import Image from "next/image";
import { useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
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
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  function handleTargetTap(targetId: string) {
    if (!selectedPromptId) return;

    const nextMatches = {
      ...matches,
      [selectedPromptId]: targetId
    };
    setMatches(nextMatches);
    setSelectedPromptId(null);
    setFeedback("");

    if (Object.keys(nextMatches).length !== config.prompts.length) return;

    const isCorrect = Object.entries(answer.correctMatches).every(
      ([promptId, correctTargetId]) => nextMatches[promptId] === correctTargetId
    );

    if (!isCorrect) {
      setMistakesCount((current) => current + 1);
      setFeedback("Some links are mixed up. Try connecting them again.");
      setMatches({});
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

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="grid gap-3">
          {config.prompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => setSelectedPromptId(prompt.id)}
            >
              <Panel
                className={`flex items-center gap-3 border-2 ${
                  selectedPromptId === prompt.id
                    ? "border-orange-300"
                    : matches[prompt.id]
                      ? "border-emerald-300"
                      : "border-transparent"
                }`}
                style={{ backgroundColor: `${prompt.color}22` }}
              >
                <span className="text-3xl">{prompt.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold">{prompt.label}</p>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    {matches[prompt.id] ? "Connected" : "Pick this first"}
                  </p>
                </div>
              </Panel>
            </button>
          ))}
        </div>

        <div className="text-center text-3xl text-slate-300">↔</div>

        <div className="grid gap-3">
          {config.targets.map((target) => (
            <button key={target.id} type="button" onClick={() => handleTargetTap(target.id)}>
              <Panel className="flex items-center gap-3 border-2 border-transparent" style={{ backgroundColor: `${target.color}22` }}>
                <span className="text-3xl">{target.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold">{target.label}</p>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Tap after choosing a match
                  </p>
                </div>
              </Panel>
            </button>
          ))}
        </div>
      </div>

      <Panel className="bg-white/80">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
          Current links
        </p>
        <div className="mt-3 grid gap-2">
          {Object.entries(matches).length === 0 ? (
            <p className="text-sm text-slate-600">Choose a friend, then choose its matching home.</p>
          ) : (
            Object.entries(matches).map(([promptId, targetId]) => {
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
