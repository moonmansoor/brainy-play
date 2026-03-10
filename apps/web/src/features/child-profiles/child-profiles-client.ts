import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  loadCurrentLocalParent,
  loadLocalChildProfiles,
  loadStoredAttempts,
  saveLocalChildProfiles
} from "@/lib/utils/storage";
import { ChildProfile, ChildThemePreferences } from "@/types/activity";

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
  const resolvedParentId = parentId ?? parent?.id;

  if (!resolvedParentId) {
    throw new Error("Parent login required.");
  }

  return {
    parentId: resolvedParentId,
    children: loadLocalChildProfiles().filter(
      (child) => child.parentId === resolvedParentId
    )
  };
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
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    getScopedLocalChildren(parentId);
    const nextChild = buildLocalChildProfile(parentId, input);
    saveLocalChildProfiles([...loadLocalChildProfiles(), nextChild]);
    return nextChild;
  }

  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: parentId,
      display_name: input.displayName,
      birth_date: input.birthDate,
      school_name: input.schoolName ?? null,
      school_standard: input.schoolStandard ?? null,
      avatar_url: input.avatarUrl ?? null,
      favorite_themes: input.themePreferences?.favoriteThemes ?? [],
      favorite_color: input.themePreferences?.favoriteColor ?? null,
      preferred_reward_style:
        input.themePreferences?.preferredRewardStyle ?? null,
      preferred_avatar_style:
        input.themePreferences?.preferredAvatarStyle ?? null,
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
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const parent = loadCurrentLocalParent();
    if (!parent) throw new Error("Parent login required.");

    const children = loadLocalChildProfiles();
    const child = children.find(
      (item) => item.id === childId && item.parentId === parent.id
    );

    if (!child) {
      throw new Error("Child profile not found.");
    }

    const updated: ChildProfile = {
      ...child,
      themePreferences: buildThemePreferences(preferences),
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
      favorite_themes: preferences.favoriteThemes,
      favorite_color: preferences.favoriteColor ?? null,
      preferred_reward_style: preferences.preferredRewardStyle ?? null,
      preferred_avatar_style: preferences.preferredAvatarStyle ?? null
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
    const parent = loadCurrentLocalParent();
    if (!parent) throw new Error("Parent login required.");

    const timestamp = new Date().toISOString();
    const children = loadLocalChildProfiles();
    const child = children.find(
      (item) => item.id === childId && item.parentId === parent.id
    );

    if (!child) {
      throw new Error("Child profile not found.");
    }

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
    const parent = loadCurrentLocalParent();
    if (!parent) throw new Error("Parent login required.");

    const child = loadLocalChildProfiles().find(
      (item) => item.id === childId && item.parentId === parent.id
    );

    if (!child) {
      throw new Error("Child profile not found.");
    }

    return child;
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
    score: attempt.score,
    starsEarned: attempt.stars_earned,
    completed: attempt.completed,
    hintsUsed: attempt.hints_used,
    mistakesCount: attempt.mistakes_count,
    durationSeconds: attempt.duration_seconds,
    startedAt: attempt.started_at,
    finishedAt: attempt.finished_at
  }));
}
