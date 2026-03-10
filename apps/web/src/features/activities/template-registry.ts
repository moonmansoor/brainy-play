import {
  ActivityDefinition,
  ActivityTemplate,
  ActivityTemplateKey,
  Difficulty,
  InteractionType,
  LearningArea,
  ThemeId
} from "@/types/activity";

export const activityTemplates: ActivityTemplate[] = [
  {
    id: "template-shape-match",
    key: "shape-match",
    title: "Shape Match",
    description: "Match visual clues to the correct shape or outline.",
    activityType: "shape-match",
    interactionType: "object-match",
    supportedThemes: ["animals", "space", "dinosaurs"],
    learningAreas: ["pattern-recognition", "spatial-thinking"],
    difficultyRules: {
      minLevel: 1,
      maxLevel: 6,
      baseItemCount: 3,
      maxItemCount: 5,
      unlocksMultiStepAtLevel: 4,
      complexityHint: "More shapes and distractors appear at higher levels."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["shapes", "outlines", "theme-icons"],
      notes: "Select a clue, then generate matching and non-matching options."
    },
    defaultExplanationText:
      "Matching shapes trains your brain to notice visual patterns. Coders use pattern noticing all the time.",
    factPool: [
      "Did you know? Honeybees can spot patterns when they search for flowers.",
      "Did you know? The moon has dark shapes called maria that look like giant spots."
    ]
  },
  {
    id: "template-count-objects",
    key: "count-objects",
    title: "Count Objects",
    description: "Count themed objects and select the matching number.",
    activityType: "count-objects",
    interactionType: "click-select",
    supportedThemes: ["space", "ocean", "robots", "animals"],
    learningAreas: ["pattern-recognition", "problem-solving", "memory"],
    difficultyRules: {
      minLevel: 1,
      maxLevel: 6,
      baseItemCount: 3,
      maxItemCount: 6,
      unlocksMultiStepAtLevel: 4,
      complexityHint: "More objects and closer number choices appear later."
    },
    generationRules: {
      minPromptCount: 2,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["countable-objects", "number-options"],
      notes: "Generate one visible count with nearby number distractors."
    },
    defaultExplanationText:
      "Counting objects strengthens careful observation. Coders also count and track things step by step.",
    factPool: [
      "Did you know? Some stars we see are much bigger than our sun.",
      "Did you know? An octopus can count small groups of objects."
    ]
  },
  {
    id: "template-pattern-builder",
    key: "pattern-builder",
    title: "Pattern Builder",
    description: "Complete and extend repeating visual patterns.",
    activityType: "pattern-complete",
    interactionType: "drag-drop",
    supportedThemes: ["nature", "animals", "robots"],
    learningAreas: ["pattern-recognition", "sequencing", "problem-solving"],
    difficultyRules: {
      minLevel: 1,
      maxLevel: 8,
      baseItemCount: 3,
      maxItemCount: 6,
      unlocksMultiStepAtLevel: 5,
      complexityHint: "Patterns become longer and may use more than one rule."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["shapes", "colors", "theme-tokens"],
      notes: "Generate one missing step with plausible distractors."
    },
    defaultExplanationText:
      "Patterns help your brain predict what comes next. That is a big part of coding and problem solving.",
    factPool: [
      "Did you know? Seashells often grow in repeating patterns.",
      "Did you know? Music uses patterns to build rhythm and melody."
    ]
  },
  {
    id: "template-logic-sorting",
    key: "logic-sorting",
    title: "Logic Sorting",
    description: "Sort objects into categories using a simple rule.",
    activityType: "sort-game",
    interactionType: "sort",
    supportedThemes: ["robots", "animals", "ocean"],
    learningAreas: ["classification", "logic-reasoning"],
    difficultyRules: {
      minLevel: 1,
      maxLevel: 8,
      baseItemCount: 4,
      maxItemCount: 8,
      unlocksMultiStepAtLevel: 5,
      complexityHint: "More categories and mixed attributes appear later."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["shapes", "objects", "colors"],
      notes: "Pick category rules first, then generate matching objects."
    },
    defaultExplanationText:
      "Sorting helps you group information by rules. Programmers sort ideas and data in clear groups too.",
    factPool: [
      "Did you know? Octopuses can sort objects to build safe hiding places.",
      "Did you know? Recycling centers sort materials so they can be reused."
    ]
  },
  {
    id: "template-sequence-ordering",
    key: "sequence-ordering",
    title: "Sequence Ordering",
    description: "Arrange events or actions in the right order.",
    activityType: "sequence-order",
    interactionType: "sequence",
    supportedThemes: ["nature", "animals", "space"],
    learningAreas: ["sequencing", "logic-reasoning", "problem-solving"],
    difficultyRules: {
      minLevel: 2,
      maxLevel: 10,
      baseItemCount: 3,
      maxItemCount: 6,
      unlocksMultiStepAtLevel: 6,
      complexityHint: "Longer stories and more steps appear at higher levels."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["story-steps", "life-cycles", "missions"],
      notes: "Use a start-middle-end structure for early levels."
    },
    defaultExplanationText:
      "Putting steps in order builds sequencing skills. Computer programs follow steps in the right order too.",
    factPool: [
      "Did you know? Butterflies change through a sequence of life stages.",
      "Did you know? Rockets follow a countdown sequence before launch."
    ]
  },
  {
    id: "template-odd-one-out",
    key: "odd-one-out",
    title: "Odd One Out",
    description: "Choose the item that breaks the group rule.",
    activityType: "odd-one-out",
    interactionType: "click-select",
    supportedThemes: ["animals", "ocean", "space"],
    learningAreas: ["classification", "logic-reasoning", "problem-solving"],
    difficultyRules: {
      minLevel: 2,
      maxLevel: 8,
      baseItemCount: 4,
      maxItemCount: 6,
      unlocksMultiStepAtLevel: 5,
      complexityHint: "The rule becomes less obvious at higher levels."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["categories", "objects", "theme-pairs"],
      notes: "Three items share a rule and one breaks it."
    },
    defaultExplanationText:
      "Finding the odd one out helps you notice rules and exceptions. Coders look for rules and bugs the same way.",
    factPool: [
      "Did you know? Penguins are birds, but they do not fly.",
      "Did you know? Bats can fly even though they are mammals."
    ]
  },
  {
    id: "template-maze-direction",
    key: "maze-direction",
    title: "Maze Direction",
    description: "Trace or build a safe path through a maze.",
    activityType: "maze-path",
    interactionType: "draw-trace",
    supportedThemes: ["space", "nature", "robots"],
    learningAreas: ["spatial-thinking", "problem-solving", "sequencing"],
    difficultyRules: {
      minLevel: 3,
      maxLevel: 10,
      baseItemCount: 1,
      maxItemCount: 3,
      unlocksMultiStepAtLevel: 6,
      complexityHint: "Mazes add more turns and blockers as levels rise."
    },
    generationRules: {
      minPromptCount: 1,
      maxPromptCount: 3,
      supportsRandomGeneration: true,
      assetPool: ["grids", "blockers", "goal-icons"],
      notes: "Generate one solvable path with a few dead ends."
    },
    defaultExplanationText:
      "Finding a path trains spatial thinking. Programmers also plan routes and steps to reach a goal.",
    factPool: [
      "Did you know? Ants can remember routes back to their nest.",
      "Did you know? Mars rovers follow planned paths to explore safely."
    ]
  },
  {
    id: "template-connect-logic",
    key: "connect-logic",
    title: "Connect The Logic",
    description: "Connect related items to show how they belong together.",
    activityType: "connect-logic",
    interactionType: "connect",
    supportedThemes: ["animals", "ocean", "robots"],
    learningAreas: ["logic-reasoning", "classification", "memory"],
    difficultyRules: {
      minLevel: 3,
      maxLevel: 10,
      baseItemCount: 2,
      maxItemCount: 5,
      unlocksMultiStepAtLevel: 7,
      complexityHint: "More pairs and more subtle relationships appear later."
    },
    generationRules: {
      minPromptCount: 2,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["pairs", "categories", "habitats", "tools"],
      notes: "Shuffle prompts and targets independently for linking."
    },
    defaultExplanationText:
      "Connecting related ideas helps your brain build logic maps. Programming often means linking actions, inputs, and results.",
    factPool: [
      "Did you know? Dolphins work together using sound to stay connected.",
      "Did you know? Circuits connect parts so electricity can travel."
    ]
  },
  {
    id: "template-code-blocks-thinking",
    key: "code-blocks-thinking",
    title: "Code Blocks Thinking",
    description: "Arrange simple blocks into the correct action order.",
    activityType: "code-blocks",
    interactionType: "block-arrange",
    supportedThemes: ["space", "robots", "nature"],
    learningAreas: ["sequencing", "problem-solving", "logic-reasoning"],
    difficultyRules: {
      minLevel: 4,
      maxLevel: 12,
      baseItemCount: 3,
      maxItemCount: 6,
      unlocksMultiStepAtLevel: 8,
      complexityHint: "Later levels use more steps and trick blocks."
    },
    generationRules: {
      minPromptCount: 3,
      maxPromptCount: 5,
      supportsRandomGeneration: true,
      assetPool: ["actions", "goals", "block-labels"],
      notes: "Build action sequences with a clear goal state."
    },
    defaultExplanationText:
      "Ordering code blocks builds the same skill real programmers use when they plan instructions step by step.",
    factPool: [
      "Did you know? The first computer programs were written as step-by-step instructions for machines.",
      "Did you know? Robots only work when their instructions are in the right order."
    ]
  },
  {
    id: "template-word-builder",
    key: "word-builder",
    title: "Word Builder",
    description: "Type a short word that completes a simple logic clue.",
    activityType: "word-builder",
    interactionType: "type-answer",
    supportedThemes: ["robots", "space", "animals"],
    learningAreas: ["memory", "logic-reasoning", "problem-solving"],
    difficultyRules: {
      minLevel: 2,
      maxLevel: 8,
      baseItemCount: 1,
      maxItemCount: 3,
      unlocksMultiStepAtLevel: 5,
      complexityHint: "Clues become less direct and use more letters."
    },
    generationRules: {
      minPromptCount: 1,
      maxPromptCount: 3,
      supportsRandomGeneration: true,
      assetPool: ["keywords", "clues", "letter-banks"],
      notes: "Use one short answer with a visible clue and letter bank."
    },
    defaultExplanationText:
      "Typing a short answer helps you connect ideas to words. Programmers also name actions and remember important terms.",
    factPool: [
      "Did you know? The word robot comes from a word that means work.",
      "Did you know? Astronauts learn many special words for space jobs."
    ]
  }
];

export function getActivityTemplate(key: ActivityTemplateKey) {
  return activityTemplates.find((template) => template.key === key) ?? null;
}

export function getActivityTemplateById(templateId: string) {
  return activityTemplates.find((template) => template.id === templateId) ?? null;
}

export function getDifficultyForLevel(level: number): Difficulty {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  return 3;
}

export function getPromptCountForLevel(level: number, template: ActivityTemplate) {
  const span = Math.max(1, template.generationRules.maxPromptCount - template.generationRules.minPromptCount);
  const normalized = Math.min(1, Math.max(0, (level - template.difficultyRules.minLevel) / Math.max(1, template.difficultyRules.maxLevel - template.difficultyRules.minLevel)));
  return (
    template.generationRules.minPromptCount + Math.round(span * normalized)
  );
}

export function pickFunFact(template: ActivityTemplate, index = 0) {
  return template.factPool[index % template.factPool.length] ?? "";
}

export function buildLearningAreaScores(
  learningAreas: LearningArea[],
  successRate: number
) {
  return learningAreas.reduce(
    (scores, area) => ({
      ...scores,
      [area]: successRate
    }),
    {} as Partial<Record<LearningArea, number>>
  );
}

export function getActivityInteractionLabel(interactionType: InteractionType) {
  switch (interactionType) {
    case "drag-drop":
      return "Drag and drop";
    case "click-select":
      return "Click selection";
    case "draw-trace":
      return "Draw and trace";
    case "type-answer":
      return "Typing";
    case "object-match":
      return "Object matching";
    case "sort":
      return "Sorting";
    case "sequence":
      return "Sequence arranging";
    case "connect":
      return "Connecting";
    case "block-arrange":
      return "Code block arranging";
  }
}

export function describeActivityForDocs(activity: ActivityDefinition) {
  return {
    title: activity.title,
    type: activity.type,
    interactionType: activity.interactionType,
    learningAreas: activity.learningAreas
  };
}

export function getTemplateLevelSummary(template: ActivityTemplate) {
  return `Levels ${template.difficultyRules.minLevel}-${template.difficultyRules.maxLevel}: ${template.difficultyRules.complexityHint}`;
}

export function templateSupportsTheme(template: ActivityTemplate, themeId: ThemeId) {
  return template.supportedThemes.includes(themeId);
}
