"use client";

import Image from "next/image";
import { useState } from "react";

import { MascotBrain } from "@/components/brand/mascot-brain";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildOutcome } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  ThemePack,
  WordBuilderAnswer,
  WordBuilderConfig
} from "@/types/activity";

export function WordBuilderGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: WordBuilderConfig;
  answer: WordBuilderAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [typedValue, setTypedValue] = useState("");
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  function handleCheck() {
    const normalized = typedValue.trim().toUpperCase();
    const acceptableAnswers = answer.acceptableAnswers.map((item) => item.toUpperCase());

    if (!acceptableAnswers.includes(normalized)) {
      setMistakesCount((current) => current + 1);
      setFeedback("That word does not fit yet. Try another letter mix.");
      return;
    }

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );
    onComplete(buildOutcome(true, mistakesCount, durationSeconds));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
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
            <p className="mt-4 rounded-[1.25rem] bg-white/80 px-4 py-4 text-lg font-semibold text-slate-800">
              {config.prompt}
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
        <p className="font-display text-2xl font-semibold">Type the answer</p>
        <div className="mt-4 rounded-[1.5rem] bg-slate-50 px-4 py-5">
          <input
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value.toUpperCase())}
            maxLength={config.placeholderLength + 2}
            className="w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.4em] text-slate-900"
            placeholder={"_ ".repeat(config.placeholderLength).trim()}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {config.keyboard.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() =>
                setTypedValue((current) =>
                  `${current}${letter}`.slice(0, config.placeholderLength + 2)
                )
              }
              className="min-h-16 rounded-[1.25rem] bg-orange-100 text-xl font-black text-orange-900 transition hover:-translate-y-0.5"
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => setTypedValue((current) => current.slice(0, -1))}>
            Delete
          </Button>
          <Button onClick={handleCheck} disabled={typedValue.trim().length === 0}>
            Check word
          </Button>
        </div>
        {feedback ? (
          <Panel className="mt-4 bg-red-50 p-4 text-sm text-red-700">
            <MascotBrain
              state="encouraging"
              size="sm"
              animation="float"
              message={feedback}
            />
          </Panel>
        ) : null}
      </Panel>
    </div>
  );
}
