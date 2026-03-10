import { z } from "zod";

const themeIdSchema = z.enum([
  "animals",
  "space",
  "dinosaurs",
  "ocean",
  "robots",
  "nature"
]);

const childThemePreferencesSchema = z.object({
  favoriteThemes: z.array(themeIdSchema).min(1).max(6),
  favoriteColor: z.string().trim().max(40).optional(),
  preferredRewardStyle: z.enum(["sparkles", "badges", "stickers"]).optional(),
  preferredAvatarStyle: z.enum(["adventurer", "dreamer", "explorer"]).optional()
});

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
    message: "Birth date must be a valid date."
  })
  .refine(
    (value) => new Date(`${value}T00:00:00.000Z`).getTime() <= Date.now(),
    {
      message: "Birth date cannot be in the future."
    }
  );

export const childProfileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  birthDate: birthDateSchema,
  schoolName: z.string().trim().max(80).optional(),
  schoolStandard: z.string().trim().max(40).optional(),
  avatarUrl: z.string().trim().url().max(500).optional(),
  themePreferences: childThemePreferencesSchema.optional()
});

export function validateChildProfileInput(input: unknown) {
  return childProfileInputSchema.safeParse(input);
}

export function validateChildThemePreferences(input: unknown) {
  return childThemePreferencesSchema.safeParse(input);
}
