import { z } from "zod";

import { ActivityType } from "@/types/activity";

const activityTypeSchema = z.enum([
  "shape-match",
  "count-objects",
  "pattern-complete",
  "sort-game",
  "odd-one-out",
  "sequence-order",
  "memory-cards",
  "logic-game",
  "maze-path"
]);

const baseActivitySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  type: activityTypeSchema,
  ageMin: z.coerce.number().int().min(4).max(12),
  ageMax: z.coerce.number().int().min(4).max(12),
  difficulty: z.coerce.number().int().min(1).max(3),
  instructionsText: z.string().min(6),
  isPublished: z.boolean(),
  settingsConfig: z.string().min(2),
  itemsConfig: z.string().min(2)
});

export type ActivityFormInput = z.infer<typeof baseActivitySchema>;

export function validateActivityForm(input: unknown) {
  return baseActivitySchema.safeParse(input);
}

export function getDefaultSettingsForType(_type: ActivityType) {
  return JSON.stringify({}, null, 2);
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
    case "count-objects":
      return JSON.stringify(
        [
          {
            promptText: "Count the objects.",
            config: {
              count: 4,
              options: [2, 3, 4, 5]
            },
            answer: {
              correctCount: 4
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
                { id: "circle-2", shape: "circle", color: "#f97316" },
                { id: "square-2", shape: "square", color: "#0ea5e9" }
              ],
              options: [
                { id: "circle-answer", shape: "circle", color: "#f97316" },
                { id: "triangle-answer", shape: "triangle", color: "#22c55e" }
              ]
            },
            answer: {
              correctOptionId: "circle-answer"
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
    case "sequence-order":
      return JSON.stringify(
        [
          {
            promptText: "Put the story in order.",
            config: {
              steps: [
                { id: "a", label: "Seed", emoji: "🌱" },
                { id: "b", label: "Sprout", emoji: "🌿" },
                { id: "c", label: "Flower", emoji: "🌸" }
              ]
            },
            answer: {
              correctOrderIds: ["a", "b", "c"]
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
    default:
      return JSON.stringify([], null, 2);
  }
}
