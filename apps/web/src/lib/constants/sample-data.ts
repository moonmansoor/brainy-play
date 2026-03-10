import {
  ActivityAttempt,
  ActivityDefinition,
  ActivityItem,
  ActivityVisualTheme,
  Badge,
  ChildProgress,
  ChildProfile,
  ParentProfile,
  RewardUnlock,
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
    progressSummary: "Loves colors and quick matching games.",
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
    progressSummary: "Strong at counting and starting pattern work.",
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
    progressSummary: "Ready for faster multi-step logic challenges.",
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

function buildActivity(
  activity: Omit<ActivityDefinition, "createdAt" | "updatedAt" | "settingsConfig"> & {
    settingsConfig?: Record<string, unknown>;
  }
): ActivityDefinition {
  return {
    ...activity,
    settingsConfig: activity.settingsConfig ?? {},
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const sampleActivities: ActivityDefinition[] = [
  buildActivity({
    id: "activity-shape-match",
    title: "Shape Match Adventure",
    slug: "shape-match-adventure",
    type: "shape-match",
    requiredLevel: 1,
    ageMin: 4,
    ageMax: 6,
    difficulty: 1,
    instructionsText: "Tap the card that matches the big shape clue.",
    thumbnailUrl: "/images/themes/animals-hero.svg",
    defaultThemeId: "animals",
    supportedThemeIds: ["animals", "space", "dinosaurs"],
    visualThemes: [
      buildVisualTheme("animals", {
        cardTitle: "Forest Shape Match",
        cardBlurb: "Help Pip match meadow signs one clue at a time.",
        heroTitle: "Match Pip's forest badge",
        heroHint: "Study the big clue and tap the same shape card.",
        shapeLabels: {
          circle: "berry badge",
          square: "picnic crate",
          triangle: "pine tree",
          star: "firefly sparkle"
        },
        shapeIcons: {
          circle: "🫐",
          square: "🧺",
          triangle: "🌲",
          star: "✨"
        }
      }),
      buildVisualTheme("space", {
        cardTitle: "Galaxy Shape Match",
        cardBlurb: "Guide Nova to the matching cosmic sign.",
        heroTitle: "Find Nova's matching space sign",
        heroHint: "Each space badge has its own shape. Match the clue exactly.",
        shapeLabels: {
          circle: "planet orb",
          square: "cargo pod",
          triangle: "rocket fin",
          star: "twinkle star"
        },
        shapeIcons: {
          circle: "🪐",
          square: "📦",
          triangle: "🚀",
          star: "⭐"
        }
      }),
      buildVisualTheme("dinosaurs", {
        cardTitle: "Dino Shape Match",
        cardBlurb: "Follow Rexi's footprints to the correct fossil sign.",
        heroTitle: "Pick the matching dino fossil shape",
        heroHint: "Look closely at the fossil clue before you choose.",
        shapeLabels: {
          circle: "fossil egg",
          square: "stone block",
          triangle: "peak rock",
          star: "claw sparkle"
        },
        shapeIcons: {
          circle: "🥚",
          square: "🧱",
          triangle: "⛰",
          star: "🌟"
        }
      })
    ],
    items: [
      buildItem(
        "activity-shape-match",
        0,
        "Which card matches the round badge?",
        {
          promptShape: "circle",
          promptColor: "#fb7185",
          options: [
            { id: "shape-1-a", shape: "circle", color: "#fb7185" },
            { id: "shape-1-b", shape: "square", color: "#60a5fa" },
            { id: "shape-1-c", shape: "triangle", color: "#34d399" },
            { id: "shape-1-d", shape: "star", color: "#facc15" }
          ]
        },
        { correctOptionId: "shape-1-a" }
      ),
      buildItem(
        "activity-shape-match",
        1,
        "Which card matches the triangle clue?",
        {
          promptShape: "triangle",
          promptColor: "#22c55e",
          options: [
            { id: "shape-2-a", shape: "square", color: "#fb7185" },
            { id: "shape-2-b", shape: "triangle", color: "#22c55e" },
            { id: "shape-2-c", shape: "circle", color: "#60a5fa" },
            { id: "shape-2-d", shape: "star", color: "#facc15" }
          ]
        },
        { correctOptionId: "shape-2-b" }
      ),
      buildItem(
        "activity-shape-match",
        2,
        "Find the sparkling star badge.",
        {
          promptShape: "star",
          promptColor: "#f59e0b",
          options: [
            { id: "shape-3-a", shape: "triangle", color: "#22c55e" },
            { id: "shape-3-b", shape: "star", color: "#f59e0b" },
            { id: "shape-3-c", shape: "circle", color: "#f97316" },
            { id: "shape-3-d", shape: "square", color: "#38bdf8" }
          ]
        },
        { correctOptionId: "shape-3-b" },
        2
      )
    ],
    isPublished: true
  }),
  buildActivity({
    id: "activity-count-objects",
    title: "Count the Treasure",
    slug: "count-the-treasure",
    type: "count-objects",
    requiredLevel: 2,
    ageMin: 4,
    ageMax: 8,
    difficulty: 1,
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
        cardBlurb: "Count the shining pearls with Coral.",
        heroTitle: "How many pearls are in Coral's reef?",
        heroHint: "Bubbles help you count one by one.",
        objectEmoji: "🫧",
        objectLabel: "pearls"
      }),
      buildVisualTheme("robots", {
        cardTitle: "Robot Bolt Count",
        cardBlurb: "Help Bolt count bright energy orbs.",
        heroTitle: "How many energy orbs power the robot room?",
        heroHint: "Count left to right like a careful engineer.",
        objectEmoji: "🔵",
        objectLabel: "energy orbs"
      }),
      buildVisualTheme("animals", {
        cardTitle: "Berry Basket Count",
        cardBlurb: "Count berries for Pip's picnic basket.",
        heroTitle: "How many berries did Pip collect?",
        heroHint: "Touch each berry once before you choose.",
        objectEmoji: "🍓",
        objectLabel: "berries"
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
        { correctCount: 6 }
      ),
      buildItem(
        "activity-count-objects",
        2,
        "Count the big group carefully.",
        { count: 7, options: [5, 6, 7, 8] },
        { correctCount: 7 },
        2
      )
    ],
    isPublished: true
  }),
  buildActivity({
    id: "activity-pattern-complete",
    title: "Pattern Parade",
    slug: "pattern-parade",
    type: "pattern-complete",
    requiredLevel: 3,
    ageMin: 5,
    ageMax: 8,
    difficulty: 2,
    instructionsText: "Look at the visual rhythm and choose what comes next.",
    thumbnailUrl: "/images/themes/nature-hero.svg",
    defaultThemeId: "nature",
    supportedThemeIds: ["nature", "animals", "robots"],
    visualThemes: [
      buildVisualTheme("nature", {
        cardTitle: "Garden Pattern Parade",
        cardBlurb: "Follow Bloom's color rhythm in the garden path.",
        heroTitle: "Which garden token comes next?",
        heroHint: "The pattern repeats in a steady beat. Watch the order.",
        shapeIcons: {
          circle: "🌸",
          square: "🪴",
          triangle: "🍃",
          star: "🦋"
        }
      }),
      buildVisualTheme("animals", {
        cardTitle: "Forest Pattern Parade",
        cardBlurb: "Spot the repeating forest signs with Pip.",
        heroTitle: "Which forest sign comes next?",
        heroHint: "Look for the same sequence starting again.",
        shapeIcons: {
          circle: "🦊",
          square: "🧺",
          triangle: "🌲",
          star: "🍄"
        }
      }),
      buildVisualTheme("robots", {
        cardTitle: "Robot Pattern Parade",
        cardBlurb: "Finish Bolt's blinking code pattern.",
        heroTitle: "Which code tile completes the pattern?",
        heroHint: "The shapes blink in a loop. Find the next code tile.",
        shapeIcons: {
          circle: "🔵",
          square: "⬜",
          triangle: "🔺",
          star: "✳️"
        }
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
            { id: "pattern-1-c", shape: "circle", color: "#fb7185" },
            { id: "pattern-1-d", shape: "square", color: "#38bdf8" }
          ],
          options: [
            { id: "pattern-1-o1", shape: "circle", color: "#fb7185" },
            { id: "pattern-1-o2", shape: "triangle", color: "#22c55e" },
            { id: "pattern-1-o3", shape: "star", color: "#facc15" }
          ]
        },
        { correctOptionId: "pattern-1-o1" }
      ),
      buildItem(
        "activity-pattern-complete",
        1,
        "Follow the shape-color rhythm.",
        {
          sequence: [
            { id: "pattern-2-a", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-b", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-c", shape: "star", color: "#f59e0b" },
            { id: "pattern-2-d", shape: "triangle", color: "#22c55e" },
            { id: "pattern-2-e", shape: "triangle", color: "#22c55e" }
          ],
          options: [
            { id: "pattern-2-o1", shape: "star", color: "#f59e0b" },
            { id: "pattern-2-o2", shape: "circle", color: "#f97316" },
            { id: "pattern-2-o3", shape: "square", color: "#60a5fa" }
          ]
        },
        { correctOptionId: "pattern-2-o1" }
      ),
      buildItem(
        "activity-pattern-complete",
        2,
        "Find the next shape in the sequence.",
        {
          sequence: [
            { id: "pattern-3-a", shape: "star", color: "#facc15" },
            { id: "pattern-3-b", shape: "circle", color: "#fb7185" },
            { id: "pattern-3-c", shape: "square", color: "#38bdf8" },
            { id: "pattern-3-d", shape: "star", color: "#facc15" },
            { id: "pattern-3-e", shape: "circle", color: "#fb7185" }
          ],
          options: [
            { id: "pattern-3-o1", shape: "square", color: "#38bdf8" },
            { id: "pattern-3-o2", shape: "triangle", color: "#22c55e" },
            { id: "pattern-3-o3", shape: "circle", color: "#fb7185" }
          ]
        },
        { correctOptionId: "pattern-3-o1" },
        3
      )
    ],
    isPublished: true
  }),
  buildActivity({
    id: "activity-odd-one-out",
    title: "Odd One Out Picnic",
    slug: "odd-one-out-picnic",
    type: "odd-one-out",
    requiredLevel: 4,
    ageMin: 5,
    ageMax: 8,
    difficulty: 2,
    instructionsText: "Find the card that does not belong with the others.",
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
      buildVisualTheme("ocean", {
        cardTitle: "Ocean Odd One Out",
        cardBlurb: "Find the sea card that does not match the reef group.",
        heroTitle: "Which reef card is different?",
        heroHint: "Look for the card that breaks the group idea."
      }),
      buildVisualTheme("space", {
        cardTitle: "Space Odd One Out",
        cardBlurb: "Find the odd card in Nova's space set.",
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
      ),
      buildItem(
        "activity-odd-one-out",
        1,
        "Three live in the sea. One does not.",
        {
          options: [
            { id: "odd-2-a", label: "Fish", emoji: "🐟", color: "#dbeafe" },
            { id: "odd-2-b", label: "Whale", emoji: "🐋", color: "#bfdbfe" },
            { id: "odd-2-c", label: "Octopus", emoji: "🐙", color: "#fde68a" },
            { id: "odd-2-d", label: "Bird", emoji: "🐦", color: "#ede9fe" }
          ]
        },
        { correctOptionId: "odd-2-d" }
      ),
      buildItem(
        "activity-odd-one-out",
        2,
        "Three are shapes with corners. One is smooth and round.",
        {
          options: [
            { id: "odd-3-a", label: "Triangle", emoji: "🔺", color: "#dcfce7" },
            { id: "odd-3-b", label: "Square", emoji: "🟦", color: "#dbeafe" },
            { id: "odd-3-c", label: "Star", emoji: "⭐", color: "#fef3c7" },
            { id: "odd-3-d", label: "Circle", emoji: "🟠", color: "#fed7aa" }
          ]
        },
        { correctOptionId: "odd-3-d" },
        3
      )
    ],
    isPublished: true
  }),
  buildActivity({
    id: "activity-sequence-order",
    title: "Story Sequence Trail",
    slug: "story-sequence-trail",
    type: "sequence-order",
    requiredLevel: 5,
    ageMin: 5,
    ageMax: 9,
    difficulty: 2,
    instructionsText: "Put the picture story cards in the correct order.",
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
      buildVisualTheme("animals", {
        cardTitle: "Forest Story Trail",
        cardBlurb: "Help Pip line up the story moments correctly.",
        heroTitle: "Put Pip's story in order",
        heroHint: "Think about what happens at the start before the end."
      }),
      buildVisualTheme("space", {
        cardTitle: "Rocket Story Trail",
        cardBlurb: "Arrange Nova's journey cards in the right order.",
        heroTitle: "Put Nova's journey in order",
        heroHint: "A trip starts before it lands. Build the story step by step."
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
      ),
      buildItem(
        "activity-sequence-order",
        1,
        "Place the morning routine in order.",
        {
          steps: [
            { id: "seq-2-a", label: "Wake up", emoji: "😴" },
            { id: "seq-2-b", label: "Brush teeth", emoji: "🪥" },
            { id: "seq-2-c", label: "Eat breakfast", emoji: "🥣" }
          ]
        },
        { correctOrderIds: ["seq-2-a", "seq-2-b", "seq-2-c"] }
      ),
      buildItem(
        "activity-sequence-order",
        2,
        "Place the rocket trip in order.",
        {
          steps: [
            { id: "seq-3-a", label: "Get ready", emoji: "👩‍🚀" },
            { id: "seq-3-b", label: "Launch", emoji: "🚀" },
            { id: "seq-3-c", label: "Orbit", emoji: "🪐" },
            { id: "seq-3-d", label: "Land", emoji: "🌍" }
          ]
        },
        { correctOrderIds: ["seq-3-a", "seq-3-b", "seq-3-c", "seq-3-d"] },
        3
      )
    ],
    isPublished: true
  }),
  buildActivity({
    id: "activity-sort-game",
    title: "Shape Sorting Safari",
    slug: "shape-sorting-safari",
    type: "sort-game",
    requiredLevel: 6,
    ageMin: 4,
    ageMax: 7,
    difficulty: 2,
    instructionsText: "Sort each shape into the correct group bucket.",
    thumbnailUrl: "/images/themes/robots-hero.svg",
    defaultThemeId: "robots",
    supportedThemeIds: ["robots", "animals", "ocean"],
    visualThemes: [
      buildVisualTheme("robots", {
        cardTitle: "Robot Sorting Lab",
        cardBlurb: "Help Bolt sort every token into the right bucket.",
        heroTitle: "Sort Bolt's tokens",
        heroHint: "Choose a token, then send it to the correct group."
      }),
      buildVisualTheme("animals", {
        cardTitle: "Forest Sorting Trail",
        cardBlurb: "Guide Pip's shape tokens into matching camps.",
        heroTitle: "Sort Pip's shape tokens",
        heroHint: "Round and pointy tokens belong in different places."
      }),
      buildVisualTheme("ocean", {
        cardTitle: "Ocean Sorting Reef",
        cardBlurb: "Coral needs help sorting sea tokens by group.",
        heroTitle: "Sort Coral's reef tokens",
        heroHint: "Watch each group label, then place the token carefully."
      })
    ],
    items: [
      buildItem(
        "activity-sort-game",
        0,
        "Sort round shapes and pointy shapes.",
        {
          groups: [
            { id: "sort-1-g1", label: "Round", emoji: "🟠", color: "#fed7aa" },
            { id: "sort-1-g2", label: "Pointy", emoji: "⭐", color: "#dbeafe" }
          ],
          options: [
            { id: "sort-1-o1", label: "Circle", emoji: "🟠", color: "#f97316", shape: "circle" },
            { id: "sort-1-o2", label: "Star", emoji: "⭐", color: "#facc15", shape: "star" },
            { id: "sort-1-o3", label: "Circle", emoji: "🟠", color: "#fb7185", shape: "circle" },
            { id: "sort-1-o4", label: "Triangle", emoji: "🔺", color: "#22c55e", shape: "triangle" }
          ]
        },
        {
          correctGroups: {
            "sort-1-o1": "sort-1-g1",
            "sort-1-o2": "sort-1-g2",
            "sort-1-o3": "sort-1-g1",
            "sort-1-o4": "sort-1-g2"
          }
        }
      ),
      buildItem(
        "activity-sort-game",
        1,
        "Sort cool colors and warm colors.",
        {
          groups: [
            { id: "sort-2-g1", label: "Warm", emoji: "☀️", color: "#fde68a" },
            { id: "sort-2-g2", label: "Cool", emoji: "❄️", color: "#bfdbfe" }
          ],
          options: [
            { id: "sort-2-o1", label: "Sun orange", emoji: "🟧", color: "#f97316" },
            { id: "sort-2-o2", label: "Ocean blue", emoji: "🟦", color: "#3b82f6" },
            { id: "sort-2-o3", label: "Leaf green", emoji: "🟩", color: "#22c55e" },
            { id: "sort-2-o4", label: "Berry pink", emoji: "🩷", color: "#ec4899" }
          ]
        },
        {
          correctGroups: {
            "sort-2-o1": "sort-2-g1",
            "sort-2-o2": "sort-2-g2",
            "sort-2-o3": "sort-2-g2",
            "sort-2-o4": "sort-2-g1"
          }
        }
      ),
      buildItem(
        "activity-sort-game",
        2,
        "Sort shapes into triangle and square homes.",
        {
          groups: [
            { id: "sort-3-g1", label: "Triangles", emoji: "🔺", color: "#dcfce7" },
            { id: "sort-3-g2", label: "Squares", emoji: "🟦", color: "#dbeafe" }
          ],
          options: [
            { id: "sort-3-o1", label: "Triangle", emoji: "🔺", color: "#22c55e", shape: "triangle" },
            { id: "sort-3-o2", label: "Square", emoji: "🟦", color: "#38bdf8", shape: "square" },
            { id: "sort-3-o3", label: "Square", emoji: "🟦", color: "#6366f1", shape: "square" },
            { id: "sort-3-o4", label: "Triangle", emoji: "🔺", color: "#f59e0b", shape: "triangle" }
          ]
        },
        {
          correctGroups: {
            "sort-3-o1": "sort-3-g1",
            "sort-3-o2": "sort-3-g2",
            "sort-3-o3": "sort-3-g2",
            "sort-3-o4": "sort-3-g1"
          }
        },
        3
      )
    ],
    isPublished: true
  })
];

export const sampleAttempts: ActivityAttempt[] = [
  {
    id: "attempt-1",
    childId: "child-1",
    activityId: "activity-shape-match",
    score: 100,
    starsEarned: 3,
    correctAnswersCount: 3,
    brainyCoinsEarned: 65,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 0,
    durationSeconds: 22,
    startedAt: "2026-03-09T08:10:00.000Z",
    finishedAt: "2026-03-09T08:10:22.000Z"
  },
  {
    id: "attempt-2",
    childId: "child-2",
    activityId: "activity-count-objects",
    score: 85,
    starsEarned: 2,
    correctAnswersCount: 3,
    brainyCoinsEarned: 65,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 1,
    durationSeconds: 31,
    startedAt: "2026-03-09T08:14:00.000Z",
    finishedAt: "2026-03-09T08:14:31.000Z"
  },
  {
    id: "attempt-3",
    childId: "child-2",
    activityId: "activity-pattern-complete",
    score: 70,
    starsEarned: 1,
    correctAnswersCount: 3,
    brainyCoinsEarned: 65,
    completed: true,
    hintsUsed: 0,
    mistakesCount: 2,
    durationSeconds: 44,
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

export const sampleChildProgress: ChildProgress[] = [
  {
    childId: "child-1",
    currentLevel: 2,
    brainyCoinsBalance: 65,
    totalBrainyCoinsEarned: 65,
    totalCorrectAnswers: 3,
    totalCompletedActivities: 1,
    lastActivityAt: "2026-03-09T08:10:22.000Z"
  },
  {
    childId: "child-2",
    currentLevel: 4,
    brainyCoinsBalance: 130,
    totalBrainyCoinsEarned: 130,
    totalCorrectAnswers: 6,
    totalCompletedActivities: 2,
    lastActivityAt: "2026-03-09T08:17:44.000Z"
  }
];

export const sampleRewardUnlocks: RewardUnlock[] = [
  {
    id: "unlock-mini-game-child-1",
    childId: "child-1",
    rewardCode: "mini-game-unlock",
    rewardType: "mini-game",
    unlockedAt: "2026-03-09T08:10:22.000Z"
  },
  {
    id: "unlock-mini-game-child-2",
    childId: "child-2",
    rewardCode: "mini-game-unlock",
    rewardType: "mini-game",
    unlockedAt: "2026-03-09T08:14:31.000Z"
  },
  {
    id: "unlock-avatar-child-2",
    childId: "child-2",
    rewardCode: "new-avatar",
    rewardType: "avatar",
    unlockedAt: "2026-03-09T08:17:44.000Z"
  }
];
