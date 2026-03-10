"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildOutcome } from "@/lib/utils/activity";
import {
  ActivityOutcome,
  ActivityVisualTheme,
  MazePathAnswer,
  MazePathConfig,
  ThemePack
} from "@/types/activity";

function isSameCell(
  left: { row: number; col: number },
  right: { row: number; col: number }
) {
  return left.row === right.row && left.col === right.col;
}

function isAdjacent(
  left: { row: number; col: number },
  right: { row: number; col: number }
) {
  return Math.abs(left.row - right.row) + Math.abs(left.col - right.col) === 1;
}

function buildDirections(path: Array<{ row: number; col: number }>) {
  const directions: Array<"up" | "down" | "left" | "right"> = [];

  for (let index = 1; index < path.length; index += 1) {
    const current = path[index];
    const previous = path[index - 1];

    if (current.row < previous.row) directions.push("up");
    else if (current.row > previous.row) directions.push("down");
    else if (current.col < previous.col) directions.push("left");
    else directions.push("right");
  }

  return directions;
}

export function MazePathGame({
  promptText,
  config,
  answer,
  visualTheme,
  themePack,
  onComplete
}: {
  promptText?: string;
  config: MazePathConfig;
  answer: MazePathAnswer;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
}) {
  const [path, setPath] = useState([{ row: config.start.row, col: config.start.col }]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt] = useState(() => Date.now());

  const blockedLookup = useMemo(
    () => new Set(config.blockedCells.map((cell) => `${cell.row}:${cell.col}`)),
    [config.blockedCells]
  );

  function handleCellTap(row: number, col: number) {
    const nextCell = { row, col };
    const last = path[path.length - 1];

    if (blockedLookup.has(`${row}:${col}`)) {
      setFeedback("That path is blocked. Try a different way.");
      return;
    }

    if (isSameCell(nextCell, config.start)) {
      setPath([nextCell]);
      setFeedback("");
      return;
    }

    if (!isAdjacent(last, nextCell)) {
      setFeedback("Move one step at a time to trace the maze.");
      return;
    }

    if (path.some((cell) => isSameCell(cell, nextCell))) {
      setFeedback("That loop goes backward. Try a fresh route.");
      return;
    }

    const nextPath = [...path, nextCell];
    setPath(nextPath);
    setFeedback("");

    if (isSameCell(nextCell, config.goal)) {
      const isCorrect =
        JSON.stringify(buildDirections(nextPath)) ===
        JSON.stringify(answer.correctPath);

      if (!isCorrect) {
        setMistakesCount((current) => current + 1);
        setFeedback("You reached the rocket, but there is a shorter safe route. Try again.");
        setPath([{ row: config.start.row, col: config.start.col }]);
        return;
      }

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000)
      );
      onComplete(buildOutcome(true, mistakesCount, durationSeconds));
    }
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
            <p className="mt-4 text-sm text-slate-700">
              {config.hintText ?? "Tap neighboring tiles to trace the path."}
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
        <p className="font-display text-2xl font-semibold">Trace the maze</p>
        <div
          className="mt-4 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: config.gridSize * config.gridSize }, (_, index) => {
            const row = Math.floor(index / config.gridSize);
            const col = index % config.gridSize;
            const key = `${row}:${col}`;
            const isBlocked = blockedLookup.has(key);
            const isStart = isSameCell({ row, col }, config.start);
            const isGoal = isSameCell({ row, col }, config.goal);
            const inPath = path.some((cell) => isSameCell(cell, { row, col }));

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellTap(row, col)}
                className={`aspect-square rounded-[1.1rem] border-2 text-sm font-black transition ${
                  isBlocked
                    ? "border-slate-300 bg-slate-300 text-slate-500"
                    : inPath
                      ? "border-emerald-400 bg-emerald-200 text-emerald-950"
                      : "border-white bg-white/90 text-slate-700"
                }`}
              >
                {isStart ? "S" : isGoal ? "G" : isBlocked ? "X" : ""}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Mistakes: <span className="font-bold">{mistakesCount}</span>
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setPath([{ row: config.start.row, col: config.start.col }]);
              setFeedback("");
            }}
          >
            Restart path
          </Button>
        </div>
        {feedback ? (
          <div className="mt-4 rounded-[1.5rem] bg-orange-50 p-4 text-sm text-orange-700">
            {feedback}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
