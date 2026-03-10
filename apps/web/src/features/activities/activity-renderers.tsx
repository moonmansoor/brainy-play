"use client";

import type { ReactElement } from "react";

import { Panel } from "@/components/ui/panel";
import { CodeBlocksGame } from "@/games/code-blocks/code-blocks-game";
import { ConnectLogicGame } from "@/games/connect-logic/connect-logic-game";
import { CountObjectsGame } from "@/games/count-objects/count-objects-game";
import { MazePathGame } from "@/games/maze-path/maze-path-game";
import { OddOneOutGame } from "@/games/odd-one-out/odd-one-out-game";
import { PatternCompleteGame } from "@/games/pattern-complete/pattern-complete-game";
import { SequenceOrderGame } from "@/games/sequence-order/sequence-order-game";
import { ShapeMatchGame } from "@/games/shape-match/shape-match-game";
import { SortGame } from "@/games/sort-game/sort-game";
import { WordBuilderGame } from "@/games/word-builder/word-builder-game";
import {
  ActivityDefinition,
  ActivityItem,
  ActivityOutcome,
  ActivityVisualTheme,
  CodeBlocksAnswer,
  CodeBlocksConfig,
  ConnectLogicAnswer,
  ConnectLogicConfig,
  CountObjectsAnswer,
  CountObjectsConfig,
  MazePathAnswer,
  MazePathConfig,
  OddOneOutAnswer,
  OddOneOutConfig,
  PatternCompleteAnswer,
  PatternCompleteConfig,
  SequenceOrderAnswer,
  SequenceOrderConfig,
  ShapeMatchAnswer,
  ShapeMatchConfig,
  SortGameAnswer,
  SortGameConfig,
  ThemePack,
  WordBuilderAnswer,
  WordBuilderConfig
} from "@/types/activity";

export type ActivityRendererProps = {
  item: ActivityItem;
  visualTheme: ActivityVisualTheme;
  themePack: ThemePack;
  onComplete: (outcome: ActivityOutcome) => void;
};

type Renderer = (props: ActivityRendererProps) => ReactElement;

export const activityRenderers: Partial<Record<ActivityDefinition["type"], Renderer>> = {
  "shape-match": ({ item, visualTheme, themePack, onComplete }) => (
    <ShapeMatchGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as ShapeMatchConfig}
      answer={item.answer as ShapeMatchAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "count-objects": ({ item, visualTheme, themePack, onComplete }) => (
    <CountObjectsGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as CountObjectsConfig}
      answer={item.answer as CountObjectsAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "pattern-complete": ({ item, visualTheme, themePack, onComplete }) => (
    <PatternCompleteGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as PatternCompleteConfig}
      answer={item.answer as PatternCompleteAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "odd-one-out": ({ item, visualTheme, themePack, onComplete }) => (
    <OddOneOutGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as OddOneOutConfig}
      answer={item.answer as OddOneOutAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "sequence-order": ({ item, visualTheme, themePack, onComplete }) => (
    <SequenceOrderGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as SequenceOrderConfig}
      answer={item.answer as SequenceOrderAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "sort-game": ({ item, visualTheme, themePack, onComplete }) => (
    <SortGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as SortGameConfig}
      answer={item.answer as SortGameAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "maze-path": ({ item, visualTheme, themePack, onComplete }) => (
    <MazePathGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as MazePathConfig}
      answer={item.answer as MazePathAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "connect-logic": ({ item, visualTheme, themePack, onComplete }) => (
    <ConnectLogicGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as ConnectLogicConfig}
      answer={item.answer as ConnectLogicAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "code-blocks": ({ item, visualTheme, themePack, onComplete }) => (
    <CodeBlocksGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as CodeBlocksConfig}
      answer={item.answer as CodeBlocksAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  ),
  "word-builder": ({ item, visualTheme, themePack, onComplete }) => (
    <WordBuilderGame
      key={item.id}
      promptText={item.promptText}
      config={item.config as WordBuilderConfig}
      answer={item.answer as WordBuilderAnswer}
      visualTheme={visualTheme}
      themePack={themePack}
      onComplete={onComplete}
    />
  )
};

export function renderActivityItemGame(
  activityType: ActivityDefinition["type"],
  props: ActivityRendererProps
) {
  const renderer = activityRenderers[activityType];

  if (!renderer) {
    return (
      <Panel>
        <p className="font-display text-2xl font-semibold">
          This activity type is not playable yet.
        </p>
      </Panel>
    );
  }

  return renderer(props);
}
