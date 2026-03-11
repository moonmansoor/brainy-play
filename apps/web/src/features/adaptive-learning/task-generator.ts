import {
  AdaptiveActivitySession,
  ActivityAttempt,
  ActivityDefinition,
  ActivityItem,
  ChildProfile,
  GeneratedTaskInstance,
  ShapeKind
} from "@/types/activity";
import {
  getActivityTemplate,
  getPromptCountForLevel,
  pickFunFact
} from "@/features/activities/template-registry";
import {
  buildDefaultSkillProgress,
  evaluateSkillProgress
} from "@/features/adaptive-learning/mastery";
import {
  deriveSkillAreasForActivity,
  getPrimarySkillArea,
  getSkillLevelLabel
} from "@/features/adaptive-learning/skill-taxonomy";

type GeneratorContext = {
  activity: ActivityDefinition;
  child: ChildProfile;
  attempts: ActivityAttempt[];
};

type SeededRng = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: T[]) => T;
  shuffle: <T>(items: T[]) => T[];
};

const generatorVersion = "adaptive-v1";
const colors = [
  "#fb7185",
  "#60a5fa",
  "#34d399",
  "#facc15",
  "#c084fc",
  "#f97316"
];
const shapes: ShapeKind[] = ["circle", "square", "triangle", "star"];
const oddOneOutSets = [
  {
    groupLabel: "fruits",
    options: [
      ["Apple", "🍎"],
      ["Pear", "🍐"],
      ["Banana", "🍌"]
    ],
    odd: ["Rocket", "🚀"]
  },
  {
    groupLabel: "sea animals",
    options: [
      ["Fish", "🐟"],
      ["Dolphin", "🐬"],
      ["Whale", "🐳"]
    ],
    odd: ["Robot", "🤖"]
  },
  {
    groupLabel: "vehicles",
    options: [
      ["Car", "🚗"],
      ["Bus", "🚌"],
      ["Train", "🚂"]
    ],
    odd: ["Apple", "🍎"]
  }
];
const sequenceStories = [
  [
    ["Seed", "🌱"],
    ["Sprout", "🌿"],
    ["Flower", "🌸"],
    ["Fruit", "🍓"]
  ],
  [
    ["Wake", "😴"],
    ["Dress", "👕"],
    ["Eat", "🍽️"],
    ["Play", "⚽"]
  ],
  [
    ["Count down", "3️⃣"],
    ["Launch", "🚀"],
    ["Orbit", "🪐"],
    ["Land", "🌕"]
  ]
];
const connectSets = [
  [
    ["Bee", "🐝", "Flower", "🌸"],
    ["Fish", "🐟", "Pond", "🌊"],
    ["Bird", "🐦", "Nest", "🪺"],
    ["Robot", "🤖", "Charging dock", "🔋"]
  ],
  [
    ["Astronaut", "🧑‍🚀", "Rocket", "🚀"],
    ["Painter", "🎨", "Brush", "🖌️"],
    ["Gardener", "🧑‍🌾", "Watering can", "🪴"],
    ["Chef", "🧑‍🍳", "Pan", "🍳"]
  ]
];
const wordClues = [
  {
    prompt: "A robot follows a ___ to know what to do next.",
    answer: "PLAN"
  },
  {
    prompt: "The first step in a sequence is the ___.",
    answer: "START"
  },
  {
    prompt: "A repeated design is called a ___.",
    answer: "PATTERN"
  },
  {
    prompt: "A maze needs the right ___ to reach the goal.",
    answer: "PATH"
  }
];
const blockScenarios = [
  {
    prompt: "Put the launch steps in the right order.",
    blocks: [
      ["ready", "Get ready", "🧑‍🚀"],
      ["count", "Count down", "3️⃣"],
      ["launch", "Launch", "🚀"],
      ["celebrate", "Celebrate", "🎉"]
    ]
  },
  {
    prompt: "Put the garden helper steps in order.",
    blocks: [
      ["seed", "Plant seed", "🌱"],
      ["water", "Water plant", "💧"],
      ["grow", "Grow sprout", "🌿"],
      ["bloom", "See flower", "🌸"]
    ]
  }
];

function createSeed(seedText: string) {
  let hash = 2166136261;

  for (const char of seedText) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seedText: string): SeededRng {
  let state = createSeed(seedText);

  function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  }

  function int(min: number, max: number) {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function pick<T>(items: T[]) {
    return items[int(0, items.length - 1)];
  }

  function shuffle<T>(items: T[]) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = int(0, index);
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  }

  return { next, int, pick, shuffle };
}

function buildLevelBand(level: number) {
  return {
    roundCount: Math.min(5, Math.max(3, Math.ceil(level / 2) + 2)),
    distractorCount: level <= 2 ? 2 : level <= 5 ? 3 : 4,
    optionCount: level <= 2 ? 3 : level <= 5 ? 4 : 5,
    gridSize: level <= 3 ? 4 : level <= 6 ? 5 : 6,
    sequenceLength: level <= 2 ? 3 : level <= 5 ? 4 : 5
  };
}

function buildSessionSeed(context: GeneratorContext, level: number) {
  const attemptsAtLevel = context.attempts.filter(
    (attempt) =>
      attempt.childId === context.child.id &&
      attempt.activityId === context.activity.id &&
      attempt.levelPlayed === level
  ).length;

  return `${generatorVersion}:${context.child.id}:${context.activity.id}:${level}:${attemptsAtLevel + 1}`;
}

function buildItemBase(
  activityId: string,
  sessionId: string,
  index: number,
  promptText: string
) {
  const timestamp = new Date().toISOString();

  return {
    id: `${sessionId}-item-${index + 1}`,
    activityId,
    orderIndex: index,
    promptText,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function generateShapeMatchItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  optionCount: number
) {
  return Array.from({ length: roundCount }, (_, index) => {
    const promptShape = rng.pick(shapes);
    const correctColor = rng.pick(colors);
    const distractorShapes = rng
      .shuffle(shapes.filter((shape) => shape !== promptShape))
      .slice(0, optionCount - 1);
    const options = rng.shuffle([
      {
        id: `${sessionId}-shape-${index}-correct`,
        shape: promptShape,
        color: correctColor
      },
      ...distractorShapes.map((shape, distractorIndex) => ({
        id: `${sessionId}-shape-${index}-${distractorIndex}`,
        shape,
        color: rng.pick(colors)
      }))
    ]);
    const correct = options.find((option) => option.shape === promptShape)!;

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        `Find the ${promptShape} clue.`
      ),
      config: {
        promptShape,
        promptColor: correctColor,
        options
      },
      answer: {
        correctOptionId: correct.id
      }
    } satisfies ActivityItem;
  });
}

function generateCountItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  optionCount: number,
  level: number
) {
  const maxCount = Math.min(12, level + 3 + optionCount);

  return Array.from({ length: roundCount }, (_, index) => {
    const count = rng.int(2, maxCount);
    const options = Array.from(
      new Set(
        [
          count,
          count - 1,
          count + 1,
          count + 2,
          count - 2,
          rng.int(1, maxCount)
        ].filter((value) => value > 0 && value <= maxCount)
      )
    ).slice(0, optionCount);

    while (options.length < optionCount) {
      const next = rng.int(1, maxCount);
      if (!options.includes(next)) options.push(next);
    }

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Count each object, then choose the matching number."
      ),
      config: {
        count,
        options: rng.shuffle(options)
      },
      answer: {
        correctCount: count
      }
    } satisfies ActivityItem;
  });
}

function generatePatternItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  optionCount: number,
  sequenceLength: number
) {
  const patternModes = ["AB", "AAB", "ABC"] as const;

  return Array.from({ length: roundCount }, (_, index) => {
    const mode = patternModes[Math.min(patternModes.length - 1, rng.int(0, 2))];
    const palette = rng.shuffle(colors).slice(0, 3);
    const selectedShapes = rng.shuffle(shapes).slice(0, mode === "ABC" ? 3 : 2);
    const patternSource =
      mode === "AB"
        ? [selectedShapes[0], selectedShapes[1]]
        : mode === "AAB"
          ? [selectedShapes[0], selectedShapes[0], selectedShapes[1]]
          : [selectedShapes[0], selectedShapes[1], selectedShapes[2]];

    const steps = Array.from({ length: sequenceLength }, (_, stepIndex) => {
      const shape = patternSource[stepIndex % patternSource.length];
      return {
        id: `${sessionId}-pattern-step-${index}-${stepIndex}`,
        shape,
        color: palette[stepIndex % palette.length]
      };
    });
    const nextShape = patternSource[sequenceLength % patternSource.length];
    const options = rng.shuffle([
      {
        id: `${sessionId}-pattern-${index}-correct`,
        shape: nextShape,
        color: palette[sequenceLength % palette.length]
      },
      ...rng
        .shuffle(shapes.filter((shape) => shape !== nextShape))
        .slice(0, optionCount - 1)
        .map((shape, distractorIndex) => ({
          id: `${sessionId}-pattern-${index}-${distractorIndex}`,
          shape,
          color: rng.pick(colors)
        }))
    ]);

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Look for the repeating pattern and choose what comes next."
      ),
      config: {
        sequence: steps,
        options
      },
      answer: {
        correctOptionId: options.find((option) => option.shape === nextShape)!.id
      }
    } satisfies ActivityItem;
  });
}

function generateSortItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  level: number
) {
  const groupModes = [
    {
      groups: [
        { id: "round", label: "Round", emoji: "🟠", color: "#fed7aa" },
        { id: "pointy", label: "Pointy", emoji: "🔺", color: "#dbeafe" }
      ],
      buildOptions: () =>
        rng.shuffle([
          { label: "Circle", emoji: "🟠", color: "#f97316", shape: "circle", groupId: "round" },
          { label: "Square", emoji: "🟦", color: "#60a5fa", shape: "square", groupId: "round" },
          { label: "Triangle", emoji: "🔺", color: "#34d399", shape: "triangle", groupId: "pointy" },
          { label: "Star", emoji: "⭐", color: "#facc15", shape: "star", groupId: "pointy" }
        ]),
      prompt: "Sort the shapes into the right group."
    },
    {
      groups: [
        { id: "alive", label: "Living", emoji: "🌿", color: "#dcfce7" },
        { id: "made", label: "Made by people", emoji: "🛠️", color: "#dbeafe" }
      ],
      buildOptions: () =>
        rng.shuffle([
          { label: "Tree", emoji: "🌳", color: "#86efac", groupId: "alive" },
          { label: "Fish", emoji: "🐟", color: "#7dd3fc", groupId: "alive" },
          { label: "Robot", emoji: "🤖", color: "#c4b5fd", groupId: "made" },
          { label: "Car", emoji: "🚗", color: "#fdba74", groupId: "made" }
        ]),
      prompt: "Sort what is living and what is made."
    }
  ];

  return Array.from({ length: roundCount }, (_, index) => {
    const mode = rng.pick(groupModes);
    const options = mode.buildOptions().slice(0, Math.min(4 + Math.floor(level / 3), 6));

    return {
      ...buildItemBase(context.activity.id, sessionId, index, mode.prompt),
      config: {
        groups: mode.groups,
        options: options.map((option, optionIndex) => ({
          id: `${sessionId}-sort-${index}-${optionIndex}`,
          label: option.label,
          emoji: option.emoji,
          color: option.color,
          shape: "shape" in option ? (option.shape as ShapeKind | undefined) : undefined
        }))
      },
      answer: {
        correctGroups: options.reduce<Record<string, string>>((result, option, optionIndex) => {
          result[`${sessionId}-sort-${index}-${optionIndex}`] = option.groupId;
          return result;
        }, {})
      }
    } satisfies ActivityItem;
  });
}

function generateOddItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  optionCount: number
) {
  return Array.from({ length: roundCount }, (_, index) => {
    const set = rng.pick(oddOneOutSets);
    const options = rng.shuffle([
      ...set.options.slice(0, optionCount - 1).map(([label, emoji], optionIndex) => ({
        id: `${sessionId}-odd-${index}-${optionIndex}`,
        label,
        emoji,
        color: rng.pick(["#fecaca", "#fef3c7", "#dcfce7", "#dbeafe"])
      })),
      {
        id: `${sessionId}-odd-${index}-odd`,
        label: set.odd[0],
        emoji: set.odd[1],
        color: "#e9d5ff"
      }
    ]);

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        `Three are ${set.groupLabel}. One does not belong.`
      ),
      config: { options },
      answer: {
        correctOptionId: options.find((option) => option.label === set.odd[0])!.id
      }
    } satisfies ActivityItem;
  });
}

function generateSequenceItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  sequenceLength: number
) {
  return Array.from({ length: roundCount }, (_, index) => {
    const story = rng.pick(sequenceStories).slice(0, sequenceLength);
    const steps = story.map(([label, emoji], stepIndex) => ({
      id: `${sessionId}-sequence-${index}-${stepIndex}`,
      label,
      emoji
    }));

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Put the story steps in the right order."
      ),
      config: { steps },
      answer: {
        correctOrderIds: steps.map((step) => step.id)
      }
    } satisfies ActivityItem;
  });
}

function buildMazePath(rng: SeededRng, gridSize: number) {
  const path = [{ row: 0, col: 0 }];
  let row = 0;
  let col = 0;

  while (row < gridSize - 1 || col < gridSize - 1) {
    const moveRight = col < gridSize - 1 && (row === gridSize - 1 || rng.next() > 0.45);

    if (moveRight) {
      col += 1;
      path.push({ row, col });
      continue;
    }

    row += 1;
    path.push({ row, col });
  }

  const pathLookup = new Set(path.map((cell) => `${cell.row}:${cell.col}`));
  const blockedCells = [];

  for (let currentRow = 0; currentRow < gridSize; currentRow += 1) {
    for (let currentCol = 0; currentCol < gridSize; currentCol += 1) {
      if (pathLookup.has(`${currentRow}:${currentCol}`)) continue;
      if (rng.next() > 0.2) {
        blockedCells.push({ row: currentRow, col: currentCol });
      }
    }
  }

  const directions = [];

  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];

    if (current.col > previous.col) directions.push("right");
    else directions.push("down");
  }

  return {
    start: path[0],
    goal: path[path.length - 1],
    blockedCells,
    correctPath: directions as Array<"right" | "down">
  };
}

function generateMazeItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  gridSize: number
) {
  return Array.from({ length: roundCount }, (_, index) => {
    const maze = buildMazePath(rng, gridSize);

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Reach the goal by tracing the safe route."
      ),
      config: {
        gridSize,
        start: maze.start,
        goal: maze.goal,
        blockedCells: maze.blockedCells,
        hintText: "Move one step at a time."
      },
      answer: {
        correctPath: maze.correctPath
      }
    } satisfies ActivityItem;
  });
}

function generateConnectItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  level: number
) {
  const pairCount = level <= 3 ? 2 : level <= 6 ? 3 : 4;

  return Array.from({ length: roundCount }, (_, index) => {
    const selectedPairs = rng.pick(connectSets).slice(0, pairCount);
    const prompts = rng.shuffle(
      selectedPairs.map(([promptLabel, promptEmoji], pairIndex) => ({
        id: `${sessionId}-prompt-${index}-${pairIndex}`,
        label: promptLabel,
        emoji: promptEmoji,
        color: rng.pick(colors)
      }))
    );
    const targets = rng.shuffle(
      selectedPairs.map((pair, pairIndex) => ({
        id: `${sessionId}-target-${index}-${pairIndex}`,
        label: pair[2],
        emoji: pair[3],
        color: rng.pick(colors)
      }))
    );

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Connect each helper to the matching home."
      ),
      config: {
        prompts,
        targets
      },
      answer: {
        correctMatches: selectedPairs.reduce<Record<string, string>>((result, pair) => {
          const prompt = prompts.find((item) => item.label === pair[0])!;
          const target = targets.find((item) => item.label === pair[2])!;
          result[prompt.id] = target.id;
          return result;
        }, {})
      }
    } satisfies ActivityItem;
  });
}

function generateCodeBlockItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  level: number
) {
  const stepCount = level <= 4 ? 3 : level <= 7 ? 4 : 5;

  return Array.from({ length: roundCount }, (_, index) => {
    const scenario = rng.pick(blockScenarios);
    const steps = scenario.blocks.slice(0, stepCount);
    const blocks = rng.shuffle(
      steps.map(([id, label, emoji], blockIndex) => ({
        id: `${sessionId}-${index}-${id}-${blockIndex}`,
        label,
        emoji,
        color: rng.pick(colors)
      }))
    );

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Arrange the blocks from first step to last step."
      ),
      config: {
        prompt: scenario.prompt,
        blocks
      },
      answer: {
        correctOrderIds: steps.map(([id]) =>
          blocks.find((block) => block.id.includes(`-${id}-`))!.id
        )
      }
    } satisfies ActivityItem;
  });
}

function generateWordItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  roundCount: number,
  level: number
) {
  const filtered = wordClues.filter((clue) => clue.answer.length <= Math.max(4, level + 2));

  return Array.from({ length: roundCount }, (_, index) => {
    const clue = rng.pick(filtered.length > 0 ? filtered : wordClues);
    const keyboard = rng.shuffle(
      Array.from(new Set([...clue.answer.split(""), ...rng.pick(["R", "S", "T", "L", "O", "N"]).split("")]))
    );

    return {
      ...buildItemBase(
        context.activity.id,
        sessionId,
        index,
        "Use the letter bank to spell the answer."
      ),
      config: {
        prompt: clue.prompt,
        placeholderLength: clue.answer.length,
        keyboard: keyboard.slice(0, Math.min(9, clue.answer.length + 3)),
        acceptableAnswers: [clue.answer]
      },
      answer: {
        acceptableAnswers: [clue.answer]
      }
    } satisfies ActivityItem;
  });
}

function generateActivityItems(
  context: GeneratorContext,
  sessionId: string,
  rng: SeededRng,
  level: number
) {
  const template = getActivityTemplate(context.activity.templateKey);
  const promptCount = template
    ? getPromptCountForLevel(level, template)
    : buildLevelBand(level).roundCount;
  const band = buildLevelBand(level);

  switch (context.activity.type) {
    case "shape-match":
      return generateShapeMatchItems(context, sessionId, rng, promptCount, band.optionCount);
    case "count-objects":
      return generateCountItems(context, sessionId, rng, promptCount, band.optionCount, level);
    case "pattern-complete":
      return generatePatternItems(context, sessionId, rng, promptCount, band.optionCount, band.sequenceLength);
    case "sort-game":
      return generateSortItems(context, sessionId, rng, Math.max(2, promptCount - 1), level);
    case "odd-one-out":
      return generateOddItems(context, sessionId, rng, promptCount, band.optionCount);
    case "sequence-order":
      return generateSequenceItems(context, sessionId, rng, Math.max(2, promptCount - 1), band.sequenceLength);
    case "maze-path":
      return generateMazeItems(context, sessionId, rng, Math.max(2, promptCount - 2), band.gridSize);
    case "connect-logic":
      return generateConnectItems(context, sessionId, rng, Math.max(2, promptCount - 1), level);
    case "code-blocks":
      return generateCodeBlockItems(context, sessionId, rng, Math.max(2, promptCount - 1), level);
    case "word-builder":
      return generateWordItems(context, sessionId, rng, Math.max(2, promptCount - 2), level);
    default:
      return context.activity.items.length > 0 ? context.activity.items : [];
  }
}

export function buildAdaptiveActivitySession(
  context: GeneratorContext
): AdaptiveActivitySession {
  const skillAreas = deriveSkillAreasForActivity(context.activity);
  const primarySkill = getPrimarySkillArea(context.activity);
  const relevantAttempts = context.attempts.filter(
    (attempt) => attempt.childId === context.child.id
  );
  const masteryBefore =
    evaluateSkillProgress(context.child.id, primarySkill, relevantAttempts) ??
    buildDefaultSkillProgress(context.child.id, primarySkill);
  const level = Math.max(1, masteryBefore.currentLevel);
  const sessionSeed = buildSessionSeed(context, level);
  const rng = createRng(sessionSeed);
  const sessionId = `${context.activity.slug}-${level}-${sessionSeed.replace(/[^a-z0-9-]/gi, "").slice(-12)}`;
  const generatedItems = generateActivityItems(context, sessionId, rng, level);
  const template = getActivityTemplate(context.activity.templateKey);
  const taskInstance: GeneratedTaskInstance = {
    id: `${sessionId}-task-instance`,
    sessionId,
    activityId: context.activity.id,
    activityType: context.activity.type,
    childId: context.child.id,
    level,
    skillArea: primarySkill,
    skillAreas,
    generatorSeed: sessionSeed,
    generatorVersion,
    generatedAt: new Date().toISOString(),
    generatedConfig: {
      items: generatedItems
    },
    expectedAnswerSnapshot: generatedItems.map((item) => item.answer)
  };

  return {
    sessionId,
    activity: context.activity,
    taskInstance,
    generatedItems,
    currentLevel: level,
    levelLabel: getSkillLevelLabel(primarySkill, level),
    skillArea: primarySkill,
    skillAreas,
    masteryBefore,
    explanationText:
      context.activity.explanationText || template?.defaultExplanationText || "",
    funFact: context.activity.funFact || (template ? pickFunFact(template, level) : "")
  };
}
