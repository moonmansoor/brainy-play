import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  validateChildProfileInput,
  validateChildThemePreferences
} from "@/lib/validation/child-profile";
import {
  loadCurrentLocalParent,
  loadLocalChildProfiles,
  loadStoredAttempts,
  saveLocalChildProfiles
} from "@/lib/utils/storage";
import {
  ActivityAttempt,
  ChildProfile,
  ChildThemePreferences
} from "@/types/activity";

export type ChildProfileInput = {
  displayName: string;
  birthDate: string;
  schoolName?: string;
  schoolStandard?: string;
  avatarUrl?: string;
  themePreferences?: ChildThemePreferences;
};

function mapChildProfile(row: {
  id: string;
  parent_id: string;
  display_name: string;
  birth_date: string;
  school_name: string | null;
  school_standard: string | null;
  avatar_url: string | null;
  favorite_themes: string[] | null;
  favorite_color: string | null;
  preferred_reward_style: string | null;
  preferred_avatar_style: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}): ChildProfile {
  return {
    id: row.id,
    parentId: row.parent_id,
    displayName: row.display_name,
    birthDate: row.birth_date,
    schoolName: row.school_name ?? undefined,
    schoolStandard: row.school_standard ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    themePreferences: {
      favoriteThemes: (row.favorite_themes ?? []) as ChildThemePreferences["favoriteThemes"],
      favoriteColor: row.favorite_color ?? undefined,
      preferredRewardStyle:
        (row.preferred_reward_style as ChildThemePreferences["preferredRewardStyle"]) ??
        undefined,
      preferredAvatarStyle:
        (row.preferred_avatar_style as ChildThemePreferences["preferredAvatarStyle"]) ??
        undefined
    }
  };
}

function buildThemePreferences(
  preferences?: ChildThemePreferences
): ChildThemePreferences {
  return {
    favoriteThemes: preferences?.favoriteThemes?.length
      ? preferences.favoriteThemes
      : ["animals"],
    favoriteColor: preferences?.favoriteColor,
    preferredRewardStyle: preferences?.preferredRewardStyle ?? "sparkles",
    preferredAvatarStyle: preferences?.preferredAvatarStyle ?? "dreamer"
  };
}

function buildLocalChildProfile(
  parentId: string,
  input: ChildProfileInput
): ChildProfile {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    parentId,
    displayName: input.displayName.trim(),
    birthDate: input.birthDate,
    schoolName: input.schoolName?.trim() || undefined,
    schoolStandard: input.schoolStandard?.trim() || undefined,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    themePreferences: buildThemePreferences(input.themePreferences),
    createdAt: timestamp,
    updatedAt: timestamp,
    progressSummary: `${input.displayName.trim()} is ready for a personalized logic-learning path.`
  };
}

function getScopedLocalChildren(parentId?: string) {
  const parent = loadCurrentLocalParent();
  if (!parent) {
    throw new Error("Parent login required.");
  }

  if (parentId && parentId !== parent.id) {
    throw new Error("Not authorized to access another parent profile.");
  }

  return {
    parentId: parent.id,
    children: loadLocalChildProfiles().filter(
      (child) => child.parentId === parent.id
    )
  };
}

function requireOwnedLocalChild(childId: string) {
  const scoped = getScopedLocalChildren();
  const child = scoped.children.find((item) => item.id === childId);

  if (!child) {
    throw new Error("Child profile not found.");
  }

  return child;
}

export async function listChildProfiles(parentId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return getScopedLocalChildren(parentId).children;
  }

  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapChildProfile);
}

export async function createChildProfile(
  parentId: string,
  input: ChildProfileInput
) {
  const parsedInput = validateChildProfileInput(input);
  if (!parsedInput.success) {
    throw new Error(parsedInput.error.issues[0]?.message ?? "Child profile is invalid.");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const scoped = getScopedLocalChildren(parentId);
    if (scoped.children.length > 0) {
      throw new Error("This parent account already has a child profile.");
    }

    const nextChild = buildLocalChildProfile(parentId, parsedInput.data);
    saveLocalChildProfiles([...loadLocalChildProfiles(), nextChild]);
    return nextChild;
  }

  const { data: existingChildren, error: existingChildrenError } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", parentId)
    .limit(1);

  if (existingChildrenError) throw existingChildrenError;
  if ((existingChildren ?? []).length > 0) {
    throw new Error("This parent account already has a child profile.");
  }

  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: parentId,
      display_name: parsedInput.data.displayName,
      birth_date: parsedInput.data.birthDate,
      school_name: parsedInput.data.schoolName ?? null,
      school_standard: parsedInput.data.schoolStandard ?? null,
      avatar_url: parsedInput.data.avatarUrl ?? null,
      favorite_themes: parsedInput.data.themePreferences?.favoriteThemes ?? [],
      favorite_color: parsedInput.data.themePreferences?.favoriteColor ?? null,
      preferred_reward_style:
        parsedInput.data.themePreferences?.preferredRewardStyle ?? null,
      preferred_avatar_style:
        parsedInput.data.themePreferences?.preferredAvatarStyle ?? null,
      last_login_at: null
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapChildProfile(data);
}

export async function updateChildProfilePreferences(
  childId: string,
  preferences: ChildThemePreferences
) {
  const parsedPreferences = validateChildThemePreferences(preferences);
  if (!parsedPreferences.success) {
    throw new Error(
      parsedPreferences.error.issues[0]?.message ?? "Theme preferences are invalid."
    );
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const children = loadLocalChildProfiles();
    const child = requireOwnedLocalChild(childId);

    const updated: ChildProfile = {
      ...child,
      themePreferences: buildThemePreferences(parsedPreferences.data),
      updatedAt: new Date().toISOString()
    };

    saveLocalChildProfiles(
      children.map((item) => (item.id === childId ? updated : item))
    );

    return updated;
  }

  const { data, error } = await supabase
    .from("children")
    .update({
      favorite_themes: parsedPreferences.data.favoriteThemes,
      favorite_color: parsedPreferences.data.favoriteColor ?? null,
      preferred_reward_style: parsedPreferences.data.preferredRewardStyle ?? null,
      preferred_avatar_style: parsedPreferences.data.preferredAvatarStyle ?? null
    })
    .eq("id", childId)
    .select("*")
    .single();

  if (error) throw error;
  return mapChildProfile(data);
}

export async function markChildLastLogin(childId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const timestamp = new Date().toISOString();
    const children = loadLocalChildProfiles();
    const child = requireOwnedLocalChild(childId);

    const updated: ChildProfile = {
      ...child,
      lastLoginAt: timestamp,
      updatedAt: timestamp
    };

    saveLocalChildProfiles(
      children.map((item) => (item.id === childId ? updated : item))
    );

    return updated;
  }

  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from("children")
    .update({
      last_login_at: timestamp
    })
    .eq("id", childId)
    .select("*")
    .single();

  if (error) throw error;
  return mapChildProfile(data);
}

export async function getChildProfile(childId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return requireOwnedLocalChild(childId);
  }

  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (error) throw error;
  return mapChildProfile(data);
}

export async function listChildAttempts(childId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    requireOwnedLocalChild(childId);
    return loadStoredAttempts()
      .filter((attempt) => attempt.childId === childId)
      .sort((left, right) => right.finishedAt.localeCompare(left.finishedAt));
  }

  const { data, error } = await supabase
    .from("activity_attempts")
    .select("*")
    .eq("child_id", childId)
    .order("finished_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((attempt) => ({
    id: attempt.id,
    childId: attempt.child_id,
    activityId: attempt.activity_id,
    activityType: attempt.activity_type as ActivityAttempt["activityType"],
    interactionType: attempt.interaction_type as ActivityAttempt["interactionType"],
    learningAreas: (attempt.learning_areas ?? []) as ActivityAttempt["learningAreas"],
    skillAreas: (attempt.skill_areas ?? []) as ActivityAttempt["skillAreas"],
    primarySkillArea:
      (attempt.primary_skill_area as ActivityAttempt["primarySkillArea"]) ?? undefined,
    sessionId: attempt.session_id ?? undefined,
    taskInstanceId: attempt.task_instance_id ?? undefined,
    generatorSeed: attempt.generator_seed ?? undefined,
    levelPlayed: attempt.level_played,
    difficultySnapshot: attempt.difficulty_snapshot,
    score: attempt.score,
    successRate: Number(attempt.success_rate),
    correctAnswersCount: attempt.correct_answers_count,
    totalQuestions: attempt.total_questions,
    starsEarned: attempt.stars_earned,
    completed: attempt.completed,
    hintsUsed: attempt.hints_used,
    mistakesCount: attempt.mistakes_count,
    durationSeconds: attempt.duration_seconds,
    explanationText: attempt.explanation_text ?? undefined,
    funFact: attempt.fun_fact ?? undefined,
    learningAreaScores:
      (attempt.learning_area_scores_json as ActivityAttempt["learningAreaScores"]) ??
      {},
    skillAreaScores:
      (attempt.skill_area_scores_json as ActivityAttempt["skillAreaScores"]) ?? {},
    masteryLevelBefore: attempt.mastery_level_before ?? undefined,
    masteryLevelAfter: attempt.mastery_level_after ?? undefined,
    masteryScoreBefore: attempt.mastery_score_before ?? undefined,
    masteryScoreAfter: attempt.mastery_score_after ?? undefined,
    levelAdvanced: attempt.level_advanced,
    needsMorePractice:
      (attempt.needs_more_practice ?? []) as ActivityAttempt["needsMorePractice"],
    startedAt: attempt.started_at,
    finishedAt: attempt.finished_at
  }));
}
