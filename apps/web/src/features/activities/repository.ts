import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { sampleActivities } from "@/lib/constants/sample-data";
import { loadStoredActivities } from "@/lib/utils/storage";
import { ActivityDefinition, ActivityItem } from "@/types/activity";
import { Database } from "@/types/database";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
type ActivityItemRow = Database["public"]["Tables"]["activity_items"]["Row"];

function mapActivityItem(row: ActivityItemRow): ActivityItem {
  return {
    id: row.id,
    activityId: row.activity_id,
    orderIndex: row.order_index,
    promptText: row.prompt_text ?? undefined,
    config: row.config_json as ActivityItem["config"],
    answer: row.answer_json as ActivityItem["answer"],
    assetRefs:
      (row.asset_references_json as ActivityItem["assetRefs"]) ?? undefined,
    difficultyOverride: (row.difficulty_override as ActivityItem["difficultyOverride"]) ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapActivity(row: ActivityRow, items: ActivityItem[]): ActivityDefinition {
  return {
    id: row.id,
    templateId: row.template_id ?? `template-${row.type}`,
    templateKey: (row.config_json as { templateKey?: ActivityDefinition["templateKey"] })?.templateKey ?? (row.type as ActivityDefinition["templateKey"]),
    title: row.title,
    slug: row.slug,
    type: row.type as ActivityDefinition["type"],
    interactionType: row.interaction_type as ActivityDefinition["interactionType"],
    ageMin: row.age_min,
    ageMax: row.age_max,
    difficulty: row.difficulty as ActivityDefinition["difficulty"],
    recommendedLevel: row.recommended_level,
    learningAreas: (row.learning_areas as ActivityDefinition["learningAreas"]) ?? [
      "pattern-recognition"
    ],
    skillAreas:
      ((row.config_json as { skillAreas?: ActivityDefinition["skillAreas"] })?.skillAreas as
        | ActivityDefinition["skillAreas"]
        | undefined) ?? undefined,
    primarySkillArea:
      ((row.config_json as { primarySkillArea?: ActivityDefinition["primarySkillArea"] })
        ?.primarySkillArea as ActivityDefinition["primarySkillArea"]) ?? undefined,
    instructionsText: row.instructions_text,
    explanationText:
      row.explanation_text ??
      "Great job learning a new thinking skill with this activity.",
    funFact: row.fun_fact ?? "Did you know? Practice makes your brain stronger.",
    instructionsAudioUrl: row.instructions_audio_url ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    settingsConfig: (row.config_json as ActivityDefinition["settingsConfig"]) ?? {},
    defaultThemeId: (row.default_theme_id as ActivityDefinition["defaultThemeId"]) ?? "animals",
    supportedThemeIds: (row.theme_ids as ActivityDefinition["supportedThemeIds"]) ?? [
      "animals"
    ],
    visualThemes: row.visual_config_json as ActivityDefinition["visualThemes"],
    items: items.sort((left, right) => left.orderIndex - right.orderIndex),
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sortActivities(activities: ActivityDefinition[]) {
  return [...activities].sort((left, right) => left.title.localeCompare(right.title));
}

export function mergeActivities(...collections: ActivityDefinition[][]) {
  const bySlug = new Map<string, ActivityDefinition>();

  for (const collection of collections) {
    for (const activity of collection) {
      bySlug.set(activity.slug, {
        ...activity,
        items: [...activity.items].sort((left, right) => left.orderIndex - right.orderIndex)
      });
    }
  }

  return sortActivities(Array.from(bySlug.values()));
}

export function getBaseActivities() {
  return sampleActivities;
}

export function getBaseActivityBySlug(slug: string) {
  return sampleActivities.find((activity) => activity.slug === slug) ?? null;
}

async function loadSupabaseActivities() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: activityRows, error: activityError } = await supabase
    .from("activities")
    .select("*")
    .order("title", { ascending: true });

  if (activityError || !activityRows?.length) {
    return activityError ? null : [];
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("activity_items")
    .select("*")
    .in(
      "activity_id",
      activityRows.map((activity) => activity.id)
    )
    .order("order_index", { ascending: true });

  if (itemError) return null;

  const itemsByActivityId = new Map<string, ActivityItem[]>();

  for (const item of itemRows ?? []) {
    const mapped = mapActivityItem(item as ActivityItemRow);
    const current = itemsByActivityId.get(mapped.activityId) ?? [];
    itemsByActivityId.set(mapped.activityId, [...current, mapped]);
  }

  return activityRows.map((row) =>
    mapActivity(row as ActivityRow, itemsByActivityId.get(row.id) ?? [])
  );
}

export async function listActivities() {
  const supabaseActivities = await loadSupabaseActivities();
  return mergeActivities(
    sampleActivities,
    supabaseActivities ?? [],
    loadStoredActivities()
  );
}

export async function getActivityBySlug(slug: string) {
  const activities = await listActivities();
  return activities.find((activity) => activity.slug === slug) ?? null;
}
