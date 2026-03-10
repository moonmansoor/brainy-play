import { z } from "zod";

import { ActivityType, InteractionType, LearningArea } from "@/types/activity";

const activityTypeSchema = z.enum([
  "shape-match",
  "count-objects",
  "pattern-complete",
  "sort-game",
  "odd-one-out",
  "sequence-order",
  "memory-cards",
  "logic-game",
  "maze-path",
  "connect-logic",
  "code-blocks",
  "word-builder"
]);

const interactionTypeSchema = z.enum([
  "drag-drop",
  "click-select",
  "draw-trace",
  "type-answer",
  "object-match",
  "sort",
  "sequence",
  "connect",
  "block-arrange"
]);

const learningAreaSchema = z.enum([
  "pattern-recognition",
  "logic-reasoning",
  "spatial-thinking",
  "memory",
  "problem-solving",
  "sequencing",
  "classification"
]);

const baseActivitySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  type: activityTypeSchema,
  interactionType: interactionTypeSchema.default("click-select"),
  recommendedLevel: z.coerce.number().int().min(1).max(20).default(1),
  ageMin: z.coerce.number().int().min(4).max(12),
  ageMax: z.coerce.number().int().min(4).max(12),
  difficulty: z.coerce.number().int().min(1).max(3),
  instructionsText: z.string().min(6),
  explanationText: z.string().min(6).default("Great job learning a new thinking skill."),
  funFact: z.string().min(6).default("Did you know? Learning games make your brain stronger."),
  learningAreas: z
    .string()
    .default("pattern-recognition")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  isPublished: z.boolean(),
  settingsConfig: z.string().min(2),
  itemsConfig: z.string().min(2)
});

export type ActivityFormInput = z.infer<typeof baseActivitySchema>;

export function validateActivityForm(input: unknown) {
  return baseActivitySchema.safeParse(input);
}

const isoDateTimeSchema = z.string().datetime({ offset: true });

const jsonValueSchema: z.ZodType<
  string | number | boolean | null | Record<string, unknown> | unknown[]
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema)
  ])
);

const themeIdSchema = z.enum([
  "animals",
  "space",
  "dinosaurs",
  "ocean",
  "robots",
  "nature"
]);

const activityVisualThemeSchema = z.object({
  themeId: themeIdSchema,
  cardTitle: z.string().trim().min(1).max(120),
  cardBlurb: z.string().trim().min(1).max(240),
  heroTitle: z.string().trim().min(1).max(120),
  heroHint: z.string().trim().min(1).max(280),
  imageUrl: z.string().trim().min(1).max(500),
  mascotMood: z.string().trim().min(1).max(160),
  objectEmoji: z.string().trim().max(16).optional(),
  objectLabel: z.string().trim().max(60).optional(),
  shapeLabels: z
    .object({
      circle: z.string().trim().max(40).optional(),
      square: z.string().trim().max(40).optional(),
      triangle: z.string().trim().max(40).optional(),
      star: z.string().trim().max(40).optional()
    })
    .optional(),
  shapeIcons: z
    .object({
      circle: z.string().trim().max(16).optional(),
      square: z.string().trim().max(16).optional(),
      triangle: z.string().trim().max(16).optional(),
      star: z.string().trim().max(16).optional()
    })
    .optional()
});

const activityItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  activityId: z.string().trim().min(1).max(120),
  orderIndex: z.number().int().min(0).max(1000),
  promptText: z.string().trim().max(500).optional(),
  config: jsonValueSchema,
  answer: jsonValueSchema,
  assetRefs: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(120),
        assetType: z.enum(["image", "audio"]),
        label: z.string().trim().max(120).optional(),
        fileUrl: z.string().trim().max(500).optional()
      })
    )
    .max(100)
    .optional(),
  difficultyOverride: z.number().int().min(1).max(3).optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export const activityDefinitionSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    templateId: z.string().trim().min(1).max(120),
    templateKey: z.string().trim().min(1).max(120),
    title: z.string().trim().min(3).max(120),
    slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: activityTypeSchema,
    interactionType: interactionTypeSchema,
    ageMin: z.number().int().min(4).max(12),
    ageMax: z.number().int().min(4).max(12),
    difficulty: z.number().int().min(1).max(3),
    recommendedLevel: z.number().int().min(1).max(20),
    learningAreas: z.array(learningAreaSchema).min(1).max(7),
    instructionsText: z.string().trim().min(6).max(500),
    explanationText: z.string().trim().min(6).max(500),
    funFact: z.string().trim().min(6).max(500),
    instructionsAudioUrl: z.string().trim().max(500).optional(),
    thumbnailUrl: z.string().trim().max(500).optional(),
    settingsConfig: z.record(z.string(), jsonValueSchema).optional(),
    defaultThemeId: themeIdSchema,
    supportedThemeIds: z.array(themeIdSchema).min(1).max(6),
    visualThemes: z.array(activityVisualThemeSchema).min(1).max(12),
    items: z.array(activityItemSchema).min(1).max(100),
    isPublished: z.boolean(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema
  })
  .refine((value) => value.ageMin <= value.ageMax, {
    message: "Minimum age must be less than or equal to maximum age.",
    path: ["ageMax"]
  });

export const activityAttemptSchema = z
  .object({
    childId: z.string().trim().min(1).max(120),
    activityId: z.string().trim().min(1).max(120),
    activityType: activityTypeSchema,
    interactionType: interactionTypeSchema,
    learningAreas: z.array(learningAreaSchema).min(1).max(7),
    levelPlayed: z.number().int().min(1).max(20),
    difficultySnapshot: z.number().int().min(1).max(3),
    score: z.number().int().min(0).max(100),
    successRate: z.number().min(0).max(100),
    correctAnswersCount: z.number().int().min(0).max(100),
    totalQuestions: z.number().int().min(1).max(100),
    starsEarned: z.number().int().min(0).max(3),
    completed: z.boolean(),
    hintsUsed: z.number().int().min(0).max(100),
    mistakesCount: z.number().int().min(0).max(100),
    durationSeconds: z.number().int().min(0).max(86400),
    explanationText: z.string().trim().max(500).optional(),
    funFact: z.string().trim().max(500).optional(),
    learningAreaScores: z.record(learningAreaSchema, z.number().min(0).max(100)),
    startedAt: isoDateTimeSchema,
    finishedAt: isoDateTimeSchema
  })
  .refine(
    (value) =>
      new Date(value.finishedAt).getTime() >= new Date(value.startedAt).getTime(),
    {
      message: "Finish time must be after start time.",
      path: ["finishedAt"]
    }
  );

export function validateActivityDefinition(input: unknown) {
  return activityDefinitionSchema.safeParse(input);
}

export function validateActivityAttempt(input: unknown) {
  return activityAttemptSchema.safeParse(input);
}

export function getDefaultSettingsForType(type: ActivityType) {
  const byType: Record<ActivityType, Record<string, unknown>> = {
    "shape-match": {},
    "count-objects": {},
    "pattern-complete": {},
    "sort-game": {},
    "odd-one-out": {},
    "sequence-order": {},
    "memory-cards": {},
    "logic-game": {},
    "maze-path": {},
    "connect-logic": {},
    "code-blocks": {},
    "word-builder": {}
  };

  return JSON.stringify(byType[type], null, 2);
}

export function getDefaultItemsForType(type: ActivityType) {
  switch (type) {
    case "shape-match":
      return JSON.stringify(
        [
          {
            promptText: "Match the circle clue.",
            config: {
              promptShape: "circle",
              promptColor: "#fb7185",
              options: [
                { id: "circle", shape: "circle", color: "#fb7185" },
                { id: "square", shape: "square", color: "#60a5fa" },
                { id: "triangle", shape: "triangle", color: "#34d399" }
              ]
            },
            answer: {
              correctOptionId: "circle"
            }
          }
        ],
        null,
        2
      );
    case "pattern-complete":
      return JSON.stringify(
        [
          {
            promptText: "Choose the next shape.",
            config: {
              sequence: [
                { id: "circle-1", shape: "circle", color: "#f97316" },
                { id: "square-1", shape: "square", color: "#0ea5e9" },
                { id: "circle-2", shape: "circle", color: "#f97316" }
              ],
              options: [
                { id: "square-answer", shape: "square", color: "#0ea5e9" },
                { id: "triangle-answer", shape: "triangle", color: "#22c55e" }
              ]
            },
            answer: {
              correctOptionId: "square-answer"
            }
          }
        ],
        null,
        2
      );
    case "sort-game":
      return JSON.stringify(
        [
          {
            promptText: "Sort round and pointy shapes.",
            config: {
              groups: [
                { id: "round", label: "Round", emoji: "🟠", color: "#fed7aa" },
                { id: "pointy", label: "Pointy", emoji: "⭐", color: "#dbeafe" }
              ],
              options: [
                { id: "circle", label: "Circle", emoji: "🟠", color: "#f97316", shape: "circle" },
                { id: "star", label: "Star", emoji: "⭐", color: "#facc15", shape: "star" }
              ]
            },
            answer: {
              correctGroups: {
                circle: "round",
                star: "pointy"
              }
            }
          }
        ],
        null,
        2
      );
    case "sequence-order":
      return JSON.stringify(
        [
          {
            promptText: "Place the story in order.",
            config: {
              steps: [
                { id: "seed", label: "Seed", emoji: "🌱" },
                { id: "sprout", label: "Sprout", emoji: "🌿" },
                { id: "flower", label: "Flower", emoji: "🌸" }
              ]
            },
            answer: {
              correctOrderIds: ["seed", "sprout", "flower"]
            }
          }
        ],
        null,
        2
      );
    case "odd-one-out":
      return JSON.stringify(
        [
          {
            promptText: "Three are fruits. One is not.",
            config: {
              options: [
                { id: "a", label: "Apple", emoji: "🍎", color: "#fecaca" },
                { id: "b", label: "Pear", emoji: "🍐", color: "#dcfce7" },
                { id: "c", label: "Banana", emoji: "🍌", color: "#fef3c7" },
                { id: "d", label: "Car", emoji: "🚗", color: "#dbeafe" }
              ]
            },
            answer: {
              correctOptionId: "d"
            }
          }
        ],
        null,
        2
      );
    case "maze-path":
      return JSON.stringify(
        [
          {
            promptText: "Trace a safe path to the rocket.",
            config: {
              gridSize: 5,
              start: { row: 0, col: 0 },
              goal: { row: 4, col: 4 },
              blockedCells: [
                { row: 1, col: 1 },
                { row: 1, col: 2 },
                { row: 3, col: 3 }
              ]
            },
            answer: {
              correctPath: ["right", "right", "down", "down", "down", "right", "right", "down"]
            }
          }
        ],
        null,
        2
      );
    case "connect-logic":
      return JSON.stringify(
        [
          {
            promptText: "Connect each helper to the right home.",
            config: {
              prompts: [
                { id: "fish", label: "Fish", emoji: "🐟", color: "#bfdbfe" },
                { id: "bird", label: "Bird", emoji: "🐦", color: "#fde68a" }
              ],
              targets: [
                { id: "water", label: "Water", emoji: "🌊", color: "#dbeafe" },
                { id: "sky", label: "Sky", emoji: "☁️", color: "#ede9fe" }
              ]
            },
            answer: {
              correctMatches: {
                fish: "water",
                bird: "sky"
              }
            }
          }
        ],
        null,
        2
      );
    case "code-blocks":
      return JSON.stringify(
        [
          {
            promptText: "Build the steps for a rocket launch.",
            config: {
              prompt: "Put the code blocks in the right order.",
              blocks: [
                { id: "ready", label: "Get ready", emoji: "🧑‍🚀", color: "#dbeafe" },
                { id: "count", label: "Count down", emoji: "3️⃣", color: "#fde68a" },
                { id: "launch", label: "Launch", emoji: "🚀", color: "#fecaca" }
              ]
            },
            answer: {
              correctOrderIds: ["ready", "count", "launch"]
            }
          }
        ],
        null,
        2
      );
    case "word-builder":
      return JSON.stringify(
        [
          {
            promptText: "Type the missing word.",
            config: {
              prompt: "A robot follows a ___ to know what to do next.",
              placeholderLength: 4,
              keyboard: ["P", "L", "A", "N", "R", "T"],
              acceptableAnswers: ["PLAN"]
            },
            answer: {
              acceptableAnswers: ["PLAN"]
            }
          }
        ],
        null,
        2
      );
    default:
      return JSON.stringify(
        [
          {
            promptText: "Start here.",
            config: {},
            answer: {}
          }
        ],
        null,
        2
      );
  }
}

export const learningAreaOptions: LearningArea[] = [
  "pattern-recognition",
  "logic-reasoning",
  "spatial-thinking",
  "memory",
  "problem-solving",
  "sequencing",
  "classification"
];

export const interactionTypeOptions: InteractionType[] = [
  "drag-drop",
  "click-select",
  "draw-trace",
  "type-answer",
  "object-match",
  "sort",
  "sequence",
  "connect",
  "block-arrange"
];
