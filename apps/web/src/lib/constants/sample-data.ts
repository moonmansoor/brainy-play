import {
  activityTemplates,
  getActivityTemplate,
  pickFunFact
} from "@/features/activities/template-registry";
import {
  ActivityAttempt,
  ActivityDefinition,
  ActivityItem,
  ActivityTemplateKey,
  ActivityVisualTheme,
  Badge,
  ChildProfile,
  ParentProfile,
  ThemeId,
  ThemePack
} from "@/types/activity";

export const themePacks: ThemePack[] = [
  {
    id: "space",
    name: "Space",
    description: "Rocket trails, planets, and bright cosmic glow.",
    accent: "#5b7cfa",
    accentSoft: "#dbe7ff",
    accentStrong: "#2c4fe8",
    textOnAccent: "#ffffff",
    gradient: "from-[#dfe7ff] via-[#b6c9ff] to-[#fce7ff]",
    surfaceGradient: "from-[#f4f7ff] to-[#e5f1ff]",
    imageUrl: "/images/themes/space-hero.svg",
    sticker: "🚀",
    mascotName: "Nova"
  },
  {
    id: "animals",
    name: "Animals",
    description: "Friendly creatures, meadow colors, and soft sunshine.",
    accent: "#ef8b47",
    accentSoft: "#ffe6cb",
    accentStrong: "#d36625",
    textOnAccent: "#ffffff",
    gradient: "from-[#fff1d9] via-[#ffe7b6] to-[#ffd5c7]",
    surfaceGradient: "from-[#fffaf2] to-[#fff1df]",
    imageUrl: "/images/themes/animals-hero.svg",
    sticker: "🦊",
    mascotName: "Pip"
  },
  {
    id: "dinosaurs",
    name: "Dinosaurs",
    description: "Big footprints, jungle leaves, and bold fossil colors.",
    accent: "#3db27f",
    accentSoft: "#dbf8ea",
    accentStrong: "#198f5b",
    textOnAccent: "#ffffff",
    gradient: "from-[#e1f7d7] via-[#c9efb7] to-[#fff2d8]",
    surfaceGradient: "from-[#f6fff4] to-[#eefbe6]",
    imageUrl: "/images/themes/dinosaurs-hero.svg",
    sticker: "🦖",
    mascotName: "Rexi"
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Sea friends, bubbles, and bright reef colors.",
    accent: "#1f9fd7",
    accentSoft: "#d8f3ff",
    accentStrong: "#0c7db0",
    textOnAccent: "#ffffff",
    gradient: "from-[#dff8ff] via-[#b5eeff] to-[#c4e7ff]",
    surfaceGradient: "from-[#f1fcff] to-[#e3f6ff]",
    imageUrl: "/images/themes/ocean-hero.svg",
    sticker: "🐠",
    mascotName: "Coral"
  },
  {
    id: "robots",
    name: "Robots",
    description: "Cool circuits, shiny helpers, and smart future vibes.",
    accent: "#66758f",
    accentSoft: "#e6edf8",
    accentStrong: "#3f4f68",
    textOnAccent: "#ffffff",
    gradient: "from-[#eef4ff] via-[#d4dcff] to-[#d5f2ff]",
    surfaceGradient: "from-[#f7fbff] to-[#edf2ff]",
    imageUrl: "/images/themes/robots-hero.svg",
    sticker: "🤖",
    mascotName: "Bolt"
  },
  {
    id: "nature",
    name: "Nature Garden",
    description: "Flowers, butterflies, and calm bright garden scenes.",
    accent: "#d36d92",
    accentSoft: "#ffe2ed",
    accentStrong: "#b14570",
    textOnAccent: "#ffffff",
    gradient: "from-[#fff0f7] via-[#ffe0ef] to-[#f7f5bf]",
    surfaceGradient: "from-[#fff9fc] to-[#fff3e1]",
    imageUrl: "/images/themes/nature-hero.svg",
    sticker: "🌷",
    mascotName: "Bloom"
  }
];

export const sampleParents: ParentProfile[] = [
  {
    id: "parent-1",
    role: "parent",
    fullName: "Amina Rahman",
    email: "amina@example.com"
  },
  {
    id: "admin-1",
    role: "admin",
    fullName: "Teacher Nia",
    email: "teacher@example.com"
  }
];

export const sampleChildren: ChildProfile[] = [
  {
    id: "child-1",
    parentId: "parent-1",
    displayName: "Mika",
    birthDate: "2020-04-10",
    schoolStandard: "Kindergarten",
    progressSummary: "Loves visual matching and playful paths.",
    themePreferences: {
      favoriteThemes: ["animals", "nature"],
      favoriteColor: "#ef8b47",
      preferredRewardStyle: "sparkles",
      preferredAvatarStyle: "dreamer"
    }
  },
  {
    id: "child-2",
    parentId: "parent-1",
    displayName: "Rafi",
    birthDate: "2017-02-18",
    schoolStandard: "Standard 2",
    progressSummary: "Enjoys sequencing, blocks, and robot puzzles.",
    themePreferences: {
      favoriteThemes: ["space", "robots"],
      favoriteColor: "#5b7cfa",
      preferredRewardStyle: "badges",
      preferredAvatarStyle: "adventurer"
    }
  },
  {
    id: "child-3",
    parentId: "parent-1",
    displayName: "Sara",
    birthDate: "2015-11-03",
    schoolStandard: "Standard 4",
    progressSummary: "Ready for richer logic and spatial challenges.",
    themePreferences: {
      favoriteThemes: ["dinosaurs", "space"],
      favoriteColor: "#3db27f",
      preferredRewardStyle: "stickers",
      preferredAvatarStyle: "explorer"
    }
  }
];

const timestamp = "2026-03-10T08:00:00.000Z";

function getThemePack(themeId: ThemeId) {
  return themePacks.find((theme) => theme.id === themeId) ?? themePacks[0];
}

function buildVisualTheme(
  themeId: ThemeId,
  content: Omit<ActivityVisualTheme, "themeId" | "imageUrl" | "mascotMood"> &
    Partial<Pick<ActivityVisualTheme, "imageUrl" | "mascotMood">>
): ActivityVisualTheme {
  const theme = getThemePack(themeId);

  return {
    themeId,
    imageUrl: content.imageUrl ?? theme.imageUrl,
    mascotMood: content.mascotMood ?? `${theme.mascotName} is ready to help.`,
    ...content
  };
}

function buildItem(
  activityId: string,
  orderIndex: number,
  promptText: string,
  config: ActivityItem["config"],
  answer: ActivityItem["answer"],
  difficultyOverride?: ActivityItem["difficultyOverride"]
): ActivityItem {
  return {
    id: `${activityId}-item-${orderIndex + 1}`,
    activityId,
    orderIndex,
    promptText,
    config,
    answer,
    difficultyOverride,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function buildActivity(input: {
  id: string;
  templateKey: ActivityTemplateKey;
  title: string;
  slug: string;
  ageMin: number;
  ageMax: number;
  difficulty: 1 | 2 | 3;
  recommendedLevel: number;
  instructionsText: string;
  thumbnailUrl: string;
  defaultThemeId: ThemeId;
  supportedThemeIds: ThemeId[];
  visualThemes: ActivityVisualTheme[];
  items: ActivityItem[];
}) {
  const template = getActivityTemplate(input.templateKey);
  if (!template) {
    throw new Error(`Missing template ${input.templateKey}.`);
  }

  return {
    id: input.id,
    templateId: template.id,
    templateKey: template.key,
    title: input.title,
    slug: input.slug,
    type: template.activityType,
    interactionType: template.interactionType,
    ageMin: input.ageMin,
    ageMax: input.ageMax,
    difficulty: input.difficulty,
    recommendedLevel: input.recommendedLevel,
    learningAreas: template.learningAreas,
    instructionsText: input.instructionsText,
    explanationText: template.defaultExplanationText,
    funFact: pickFunFact(template, input.recommendedLevel),
    thumbnailUrl: input.thumbnailUrl,
    settingsConfig: {
      templateKey: template.key,
      generatedFromTemplate: true,
      levelBand: `${template.difficultyRules.minLevel}-${template.difficultyRules.maxLevel}`
    },
    defaultThemeId: input.defaultThemeId,
    supportedThemeIds: input.supportedThemeIds,
    visualThemes: input.visualThemes,
    items: input.items,
    isPublished: true,
    createdAt: timestamp,
    updatedAt: timestamp
  } satisfies ActivityDefinition;
}

export const sampleActivities: ActivityDefinition[] = [
  buildActivity({
    id: "activity-shape-match",
    templateKey: "shape-match",
    title: "Shape Match Adventure",
    slug: "shape-match-adventure",
    ageMin: 4,
    ageMax: 6,
    difficulty: 1,
    recommendedLevel: 1,
    instructionsText: "Match the big shape clue to the right card.",
    thumbnailUrl: "/images/themes/animals-hero.svg",
    defaultThemeId: "animals",
    supportedThemeIds: ["animals", "space", "dinosaurs"],
    visualThemes: [
      buildVisualTheme("animals", {
        cardTitle: "Forest Shape Match",
        cardBlurb: "Help Pip spot the matching badge.",
        heroTitle: "Which sign matches Pip's clue?",
        heroHint: "Look at the shape first, then tap the same one."
      }),
      buildVisualTheme("space", {
        cardTitle: "Galaxy Shape Match",
        cardBlurb: "Guide Nova to the correct cosmic sign.",
        heroTitle: "Find Nova's matching space sign",
        heroHint: "Every shape has its own space badge."
      }),
      buildVisualTheme("dinosaurs", {
        cardTitle: "Dino Shape Match",
        cardBlurb: "Follow Rexi's fossil clue to the right shape.",
        heroTitle: "Pick the matching fossil shape",
        heroHint: "Look closely before you choose."
      })
    ],
    items: [
      buildItem(
        "activity-shape-match",
        0,
        "Match the round badge.",
        {
          promptShape: "circle",
          promptColor: "#fb7185",
          options: [
            { id: "shape-1-a", shape: "circle", color: "#fb7185" },
            { id: "shape-1-b", shape: "square", color: "#60a5fa" },
            { id: "shape-1-c", shape: "triangle", color: "#34d399" }
          ]
        },
        { correctOptionId: "shape-1-a" }
      ),
      buildItem(
        "activity-shape-match",
        1,
        "Match the star clue.",
        {
          promptShape: "star",
          promptColor: "#facc15",
          options: [
            { id: "shape-2-a", shape: "triangle", color: "#22c55e" },
            { id: "shape-2-b", shape: "star", color: "#facc15" },
            { id: "shape-2-c", shape: "square", color: "#38bdf8" }
          ]
        },
        { correctOptionId: "shape-2-b" }
      )
    ]
  }),
  buildActivity({
    id: "activity-count-objects",
    templateKey: "count-objects",
    title: "Count the Treasure",
    slug: "count-the-treasure",
    ageMin: 4,
    ageMax: 8,
    difficulty: 1,
    recommendedLevel: 2,
    instructionsText: "Count each object carefully and choose the matching number.",
    thumbnailUrl: "/images/themes/space-hero.svg",
    defaultThemeId: "space",
    supportedThemeIds: ["space", "ocean", "robots", "animals"],
    visualThemes: [
      buildVisualTheme("space", {
        cardTitle: "Rocket Star Count",
        cardBlurb: "Count glowing stars floating beside Nova.",
        heroTitle: "How many stars are in Nova's sky?",
        heroHint: "Point to each star once, then tap the number.",
        objectEmoji: "⭐",
        objectLabel: "stars"
      }),
      buildVisualTheme("ocean", {
        cardTitle: "Ocean Pearl Count",
        cardBlurb: "Count shiny pearls with Coral.",
        heroTitle: "How many pearls are in Coral's reef?",
        heroHint: "Count carefully from left to right.",
        objectEmoji: "🫧",
        objectLabel: "pearls"
      })
    ],
    items: [
      buildItem(
        "activity-count-objects",
        0,
        "Count the first set.",
        { count: 4, options: [2, 3, 4, 5] },
        { correctCount: 4 }
      ),
      buildItem(
        "activity-count-objects",
        1,
        "Count the next group.",
        { count: 6, options: [4, 5, 6, 7] },
        { correctCount: 6 },
        2
      )
    ]
  }),
  buildActivity({
    id: "activity-pattern-complete",
    templateKey: "pattern-builder",
    title: "Pattern Parade",
    slug: "pattern-parade",
    ageMin: 5,
    ageMax: 8,
    difficulty: 2,
    recommendedLevel: 3,
    instructionsText: "Complete the pattern by dragging the right token into place.",
    thumbnailUrl: "/images/themes/nature-hero.svg",
    defaultThemeId: "nature",
    supportedThemeIds: ["nature", "animals", "robots"],
    visualThemes: [
      buildVisualTheme("nature", {
        cardTitle: "Garden Pattern Parade",
        cardBlurb: "Follow Bloom's color rhythm in the garden path.",
        heroTitle: "Which garden token comes next?",
        heroHint: "The pattern repeats in a steady beat."
      }),
      buildVisualTheme("robots", {
        cardTitle: "Robot Pattern Parade",
        cardBlurb: "Finish Bolt's blinking code pattern.",
        heroTitle: "Which code tile completes the pattern?",
        heroHint: "The shapes blink in a loop."
      })
    ],
    items: [
      buildItem(
        "activity-pattern-complete",
        0,
        "Choose the shape that should come next.",
        {
          sequence: [
            { id: "pattern-1-a", shape: "circle", color: "#fb7185" },
            { id: "pattern-1-b", shape: "square", color: "#38bdf8" },
            { id: "pattern-1-c", shape: "circle", color: "#fb7185" }
          ],
          options: [
            { id: "pattern-1-o1", shape: "square", color: "#38bdf8" },
            { id: "pattern-1-o2", shape: "triangle", color: "#22c55e" },
            { id: "pattern-1-o3", shape: "star", color: "#facc15" }
          ]
        },
        { correctOptionId: "pattern-1-o1" }
      ),
      buildItem(
        "activity-pattern-complete",
        1,
        "Spot the repeating visual rhythm.",
        {
          sequence: [
            { id: "pattern-2-a", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-b", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-c", shape: "star", color: "#f59e0b" }
          ],
          options: [
            { id: "pattern-2-o1", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-o2", shape: "circle", color: "#f97316" },
            { id: "pattern-2-o3", shape: "square", color: "#60a5fa" }
          ]
        },
        { correctOptionId: "pattern-2-o1" },
        2
      )
    ]
  }),
  buildActivity({
    id: "activity-sort-game",
    templateKey: "logic-sorting",
    title: "Shape Sorting Safari",
    slug: "shape-sorting-safari",
    ageMin: 4,
    ageMax: 7,
    difficulty: 2,
    recommendedLevel: 4,
    instructionsText: "Sort each object into the right logic group.",
    thumbnailUrl: "/images/themes/robots-hero.svg",
    defaultThemeId: "robots",
    supportedThemeIds: ["robots", "animals", "ocean"],
    visualThemes: [
      buildVisualTheme("robots", {
        cardTitle: "Robot Sorting Lab",
        cardBlurb: "Help Bolt sort every token into the right bucket.",
        heroTitle: "Sort Bolt's tokens",
        heroHint: "Pick a token, then send it to the correct home."
      }),
      buildVisualTheme("animals", {
        cardTitle: "Forest Sorting Trail",
        cardBlurb: "Guide Pip's tokens into matching camps.",
        heroTitle: "Sort Pip's shape tokens",
        heroHint: "Round and pointy tokens belong in different places."
      })
    ],
    items: [
      buildItem(
        "activity-sort-game",
        0,
        "Sort round and pointy shapes.",
        {
          groups: [
            { id: "sort-round", label: "Round", emoji: "🟠", color: "#fed7aa" },
            { id: "sort-pointy", label: "Pointy", emoji: "⭐", color: "#dbeafe" }
          ],
          options: [
            { id: "sort-1-o1", label: "Circle", emoji: "🟠", color: "#f97316", shape: "circle" },
            { id: "sort-1-o2", label: "Star", emoji: "⭐", color: "#facc15", shape: "star" },
            { id: "sort-1-o3", label: "Triangle", emoji: "🔺", color: "#22c55e", shape: "triangle" }
          ]
        },
        {
          correctGroups: {
            "sort-1-o1": "sort-round",
            "sort-1-o2": "sort-pointy",
            "sort-1-o3": "sort-pointy"
          }
        }
      )
    ]
  }),
  buildActivity({
    id: "activity-odd-one-out",
    templateKey: "odd-one-out",
    title: "Odd One Out Picnic",
    slug: "odd-one-out-picnic",
    ageMin: 5,
    ageMax: 8,
    difficulty: 2,
    recommendedLevel: 4,
    instructionsText: "Click the item that does not belong with the others.",
    thumbnailUrl: "/images/themes/animals-hero.svg",
    defaultThemeId: "animals",
    supportedThemeIds: ["animals", "ocean", "space"],
    visualThemes: [
      buildVisualTheme("animals", {
        cardTitle: "Forest Odd One Out",
        cardBlurb: "Spot the item that does not belong in Pip's set.",
        heroTitle: "Which forest card is different?",
        heroHint: "Three cards belong together. One card is the surprise."
      }),
      buildVisualTheme("space", {
        cardTitle: "Space Odd One Out",
        cardBlurb: "Find the odd card in Nova's set.",
        heroTitle: "Which space card is the odd one out?",
        heroHint: "Three cards fit the same set. One does not."
      })
    ],
    items: [
      buildItem(
        "activity-odd-one-out",
        0,
        "Three are fruits. One is not.",
        {
          options: [
            { id: "odd-1-a", label: "Apple", emoji: "🍎", color: "#fecaca" },
            { id: "odd-1-b", label: "Banana", emoji: "🍌", color: "#fef3c7" },
            { id: "odd-1-c", label: "Pear", emoji: "🍐", color: "#dcfce7" },
            { id: "odd-1-d", label: "Car", emoji: "🚗", color: "#dbeafe" }
          ]
        },
        { correctOptionId: "odd-1-d" }
      )
    ]
  }),
  buildActivity({
    id: "activity-sequence-order",
    templateKey: "sequence-ordering",
    title: "Story Sequence Trail",
    slug: "story-sequence-trail",
    ageMin: 5,
    ageMax: 9,
    difficulty: 2,
    recommendedLevel: 5,
    instructionsText: "Arrange the story cards in the correct order.",
    thumbnailUrl: "/images/themes/nature-hero.svg",
    defaultThemeId: "nature",
    supportedThemeIds: ["nature", "animals", "space"],
    visualThemes: [
      buildVisualTheme("nature", {
        cardTitle: "Garden Story Trail",
        cardBlurb: "Arrange Bloom's story cards in the right order.",
        heroTitle: "What happens first, next, and last?",
        heroHint: "Build the story from beginning to end."
      }),
      buildVisualTheme("space", {
        cardTitle: "Rocket Story Trail",
        cardBlurb: "Arrange Nova's journey cards in the right order.",
        heroTitle: "Put Nova's journey in order",
        heroHint: "A trip starts before it lands."
      })
    ],
    items: [
      buildItem(
        "activity-sequence-order",
        0,
        "Place the plant story in order.",
        {
          steps: [
            { id: "seq-1-a", label: "Seed", emoji: "🌱" },
            { id: "seq-1-b", label: "Sprout", emoji: "🌿" },
            { id: "seq-1-c", label: "Flower", emoji: "🌸" }
          ]
        },
        { correctOrderIds: ["seq-1-a", "seq-1-b", "seq-1-c"] }
      )
    ]
  }),
  buildActivity({
    id: "activity-maze-path",
    templateKey: "maze-direction",
    title: "Moon Maze Mission",
    slug: "moon-maze-mission",
    ageMin: 5,
    ageMax: 9,
    difficulty: 2,
    recommendedLevel: 6,
    instructionsText: "Trace a safe path through the maze to reach the rocket.",
    thumbnailUrl: "/images/themes/space-hero.svg",
    defaultThemeId: "space",
    supportedThemeIds: ["space", "nature", "robots"],
    visualThemes: [
      buildVisualTheme("space", {
        cardTitle: "Moon Maze Mission",
        cardBlurb: "Trace a route across the moon with Nova.",
        heroTitle: "Can you guide Nova to the rocket?",
        heroHint: "Draw or tap the path one step at a time."
      })
    ],
    items: [
      buildItem(
        "activity-maze-path",
        0,
        "Reach the rocket without crossing blocked craters.",
        {
          gridSize: 5,
          start: { row: 0, col: 0 },
          goal: { row: 4, col: 4 },
          blockedCells: [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 },
            { row: 3, col: 1 }
          ],
          hintText: "Try moving across the top first."
        },
        {
          correctPath: ["right", "right", "right", "right", "down", "down", "down", "down"]
        }
      )
    ]
  }),
  buildActivity({
    id: "activity-connect-logic",
    templateKey: "connect-logic",
    title: "Connect the Logic Garden",
    slug: "connect-the-logic-garden",
    ageMin: 6,
    ageMax: 10,
    difficulty: 2,
    recommendedLevel: 7,
    instructionsText: "Connect each item to the place where it belongs.",
    thumbnailUrl: "/images/themes/nature-hero.svg",
    defaultThemeId: "nature",
    supportedThemeIds: ["nature", "animals", "ocean"],
    visualThemes: [
      buildVisualTheme("nature", {
        cardTitle: "Connect the Logic Garden",
        cardBlurb: "Match each helper to the place it belongs.",
        heroTitle: "Which home matches each garden friend?",
        heroHint: "Tap one friend, then tap the matching home."
      })
    ],
    items: [
      buildItem(
        "activity-connect-logic",
        0,
        "Connect each helper to the right home.",
        {
          prompts: [
            { id: "bee", label: "Bee", emoji: "🐝", color: "#fde68a" },
            { id: "fish", label: "Fish", emoji: "🐟", color: "#bfdbfe" },
            { id: "bird", label: "Bird", emoji: "🐦", color: "#ede9fe" }
          ],
          targets: [
            { id: "flower", label: "Flower", emoji: "🌸", color: "#fecdd3" },
            { id: "pond", label: "Pond", emoji: "🌊", color: "#dbeafe" },
            { id: "nest", label: "Nest", emoji: "🪺", color: "#fed7aa" }
          ]
        },
        {
          correctMatches: {
            bee: "flower",
            fish: "pond",
            bird: "nest"
          }
        }
      )
    ]
  }),
  buildActivity({
    id: "activity-code-blocks",
    templateKey: "code-blocks-thinking",
    title: "Rocket Code Blocks",
    slug: "rocket-code-blocks",
    ageMin: 6,
    ageMax: 10,
    difficulty: 3,
    recommendedLevel: 8,
    instructionsText: "Arrange the action blocks in the correct order.",
    thumbnailUrl: "/images/themes/robots-hero.svg",
    defaultThemeId: "robots",
    supportedThemeIds: ["robots", "space", "nature"],
    visualThemes: [
      buildVisualTheme("robots", {
        cardTitle: "Rocket Code Blocks",
        cardBlurb: "Help Bolt line up the launch plan.",
        heroTitle: "Which order launches the rocket?",
        heroHint: "Build the steps from first to last like a real program."
      })
    ],
    items: [
      buildItem(
        "activity-code-blocks",
        0,
        "Build the rocket launch plan.",
        {
          prompt: "Put the code blocks in the right order.",
          blocks: [
            { id: "ready", label: "Get ready", emoji: "🧑‍🚀", color: "#dbeafe" },
            { id: "count", label: "Count down", emoji: "3️⃣", color: "#fde68a" },
            { id: "launch", label: "Launch", emoji: "🚀", color: "#fecaca" },
            { id: "celebrate", label: "Celebrate", emoji: "🎉", color: "#ddd6fe" }
          ]
        },
        {
          correctOrderIds: ["ready", "count", "launch", "celebrate"]
        }
      )
    ]
  }),
  buildActivity({
    id: "activity-word-builder",
    templateKey: "word-builder",
    title: "Robot Word Builder",
    slug: "robot-word-builder",
    ageMin: 6,
    ageMax: 9,
    difficulty: 2,
    recommendedLevel: 6,
    instructionsText: "Type the missing word using the letter bank.",
    thumbnailUrl: "/images/themes/robots-hero.svg",
    defaultThemeId: "robots",
    supportedThemeIds: ["robots", "space"],
    visualThemes: [
      buildVisualTheme("robots", {
        cardTitle: "Robot Word Builder",
        cardBlurb: "Help Bolt type the right idea word.",
        heroTitle: "Which word completes Bolt's clue?",
        heroHint: "Use the letters to spell the missing word."
      })
    ],
    items: [
      buildItem(
        "activity-word-builder",
        0,
        "Complete the sentence.",
        {
          prompt: "A robot follows a ___ to know what to do next.",
          placeholderLength: 4,
          keyboard: ["P", "L", "A", "N", "R", "T"],
          acceptableAnswers: ["PLAN"]
        },
        {
          acceptableAnswers: ["PLAN"]
        }
      )
    ]
  })
];

export const sampleAttempts: ActivityAttempt[] = [
  {
    id: "attempt-1",
    childId: "child-1",
    activityId: "activity-shape-match",
    activityType: "shape-match",
    interactionType: "object-match",
    learningAreas: ["pattern-recognition", "spatial-thinking"],
    levelPlayed: 1,
    difficultySnapshot: 1,
    score: 100,
    successRate: 100,
    correctAnswersCount: 2,
    totalQuestions: 2,
    starsEarned: 3,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 0,
    durationSeconds: 22,
    explanationText:
      "Matching shapes trains your brain to notice visual patterns. Coders use pattern noticing all the time.",
    funFact: pickFunFact(activityTemplates[0], 0),
    learningAreaScores: {
      "pattern-recognition": 100,
      "spatial-thinking": 100
    },
    startedAt: "2026-03-09T08:10:00.000Z",
    finishedAt: "2026-03-09T08:10:22.000Z"
  },
  {
    id: "attempt-2",
    childId: "child-2",
    activityId: "activity-code-blocks",
    activityType: "code-blocks",
    interactionType: "block-arrange",
    learningAreas: ["sequencing", "problem-solving", "logic-reasoning"],
    levelPlayed: 8,
    difficultySnapshot: 3,
    score: 85,
    successRate: 100,
    correctAnswersCount: 1,
    totalQuestions: 1,
    starsEarned: 2,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 1,
    durationSeconds: 31,
    explanationText: getActivityTemplate("code-blocks-thinking")?.defaultExplanationText,
    funFact: pickFunFact(getActivityTemplate("code-blocks-thinking")!, 1),
    learningAreaScores: {
      sequencing: 100,
      "problem-solving": 100,
      "logic-reasoning": 100
    },
    startedAt: "2026-03-09T08:14:00.000Z",
    finishedAt: "2026-03-09T08:14:31.000Z"
  },
  {
    id: "attempt-3",
    childId: "child-2",
    activityId: "activity-maze-path",
    activityType: "maze-path",
    interactionType: "draw-trace",
    learningAreas: ["spatial-thinking", "problem-solving", "sequencing"],
    levelPlayed: 6,
    difficultySnapshot: 2,
    score: 70,
    successRate: 100,
    correctAnswersCount: 1,
    totalQuestions: 1,
    starsEarned: 1,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 2,
    durationSeconds: 44,
    explanationText: getActivityTemplate("maze-direction")?.defaultExplanationText,
    funFact: pickFunFact(getActivityTemplate("maze-direction")!, 2),
    learningAreaScores: {
      "spatial-thinking": 100,
      "problem-solving": 100,
      sequencing: 100
    },
    startedAt: "2026-03-09T08:17:00.000Z",
    finishedAt: "2026-03-09T08:17:44.000Z"
  }
];

export const sampleBadges: Badge[] = [
  {
    id: "badge-first-star",
    code: "first-star",
    title: "First Star",
    description: "Earned after completing a first activity.",
    imageUrl: "/images/rewards/star-burst.svg"
  },
  {
    id: "badge-theme-explorer",
    code: "theme-explorer",
    title: "Theme Explorer",
    description: "Tried activities across favorite visual worlds.",
    imageUrl: "/images/rewards/badge-ribbon.svg"
  }
];
