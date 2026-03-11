import {
  ActivityAttempt,
  ActivityCompletionPayload,
  ActivityDefinition,
  ChildProfile,
  ChildThemePreferences,
  ParentProfile
} from "@/types/activity";

const ATTEMPTS_KEY = "cfb.attempts";
const ACTIVITIES_KEY = "cfb.activities";
const CHILD_PREFS_KEY = "cfb.child-preferences";
const ACTIVE_CHILD_KEY = "cfb.active-child-id";
const LOCAL_PARENTS_KEY = "cfb.local-parents";
const CURRENT_PARENT_KEY = "cfb.current-parent-id";
const LOCAL_CHILDREN_KEY = "cfb.local-children";

type LocalParentAccount = ParentProfile & {
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadStoredAttempts() {
  if (!canUseStorage()) return [] as ActivityAttempt[];

  const raw = window.localStorage.getItem(ATTEMPTS_KEY);
  if (!raw) return [] as ActivityAttempt[];

  try {
    return (JSON.parse(raw) as Partial<ActivityAttempt>[]).map((attempt) => ({
      id: attempt.id ?? crypto.randomUUID(),
      childId: attempt.childId ?? "",
      activityId: attempt.activityId ?? "",
      activityType: attempt.activityType ?? "shape-match",
      interactionType: attempt.interactionType ?? "click-select",
      learningAreas: attempt.learningAreas ?? ["pattern-recognition"],
      skillAreas: attempt.skillAreas ?? [],
      primarySkillArea: attempt.primarySkillArea,
      sessionId: attempt.sessionId,
      taskInstanceId: attempt.taskInstanceId,
      generatorSeed: attempt.generatorSeed,
      levelPlayed: attempt.levelPlayed ?? 1,
      difficultySnapshot: attempt.difficultySnapshot ?? 1,
      score: attempt.score ?? 0,
      successRate: attempt.successRate ?? 0,
      correctAnswersCount: attempt.correctAnswersCount ?? 0,
      totalQuestions: attempt.totalQuestions ?? 1,
      starsEarned: attempt.starsEarned ?? 0,
      completed: attempt.completed ?? false,
      hintsUsed: attempt.hintsUsed ?? 0,
      mistakesCount: attempt.mistakesCount ?? 0,
      durationSeconds: attempt.durationSeconds ?? 0,
      explanationText: attempt.explanationText,
      funFact: attempt.funFact,
      learningAreaScores: attempt.learningAreaScores ?? {},
      skillAreaScores: attempt.skillAreaScores ?? {},
      masteryLevelBefore: attempt.masteryLevelBefore,
      masteryLevelAfter: attempt.masteryLevelAfter,
      masteryScoreBefore: attempt.masteryScoreBefore,
      masteryScoreAfter: attempt.masteryScoreAfter,
      levelAdvanced: attempt.levelAdvanced ?? false,
      needsMorePractice: attempt.needsMorePractice ?? [],
      startedAt: attempt.startedAt ?? new Date().toISOString(),
      finishedAt: attempt.finishedAt ?? new Date().toISOString()
    }));
  } catch {
    return [] as ActivityAttempt[];
  }
}

export function saveAttemptLocally(payload: ActivityCompletionPayload) {
  if (!canUseStorage()) return null;

  const nextAttempt: ActivityAttempt = {
    id: crypto.randomUUID(),
    childId: payload.childId,
    activityId: payload.activityId,
    activityType: payload.activityType,
    interactionType: payload.interactionType,
    learningAreas: payload.learningAreas,
    skillAreas: payload.skillAreas,
    primarySkillArea: payload.primarySkillArea,
    sessionId: payload.sessionId,
    taskInstanceId: payload.taskInstanceId,
    generatorSeed: payload.generatorSeed,
    levelPlayed: payload.levelPlayed,
    difficultySnapshot: payload.difficultySnapshot,
    score: payload.score,
    successRate: payload.successRate,
    correctAnswersCount: payload.correctAnswersCount,
    totalQuestions: payload.totalQuestions,
    starsEarned: payload.starsEarned,
    completed: payload.completed,
    hintsUsed: payload.hintsUsed,
    mistakesCount: payload.mistakesCount,
    durationSeconds: payload.durationSeconds,
    explanationText: payload.explanationText,
    funFact: payload.funFact,
    learningAreaScores: payload.learningAreaScores,
    skillAreaScores: payload.skillAreaScores,
    masteryLevelBefore: payload.masteryLevelBefore,
    masteryLevelAfter: payload.masteryLevelAfter,
    masteryScoreBefore: payload.masteryScoreBefore,
    masteryScoreAfter: payload.masteryScoreAfter,
    levelAdvanced: payload.levelAdvanced,
    needsMorePractice: payload.needsMorePractice,
    startedAt: payload.startedAt,
    finishedAt: payload.finishedAt
  };

  const attempts = [nextAttempt, ...loadStoredAttempts()];
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

  return nextAttempt;
}

export function loadStoredActivities() {
  if (!canUseStorage()) return [] as ActivityDefinition[];

  const raw = window.localStorage.getItem(ACTIVITIES_KEY);
  if (!raw) return [] as ActivityDefinition[];

  try {
    return JSON.parse(raw) as ActivityDefinition[];
  } catch {
    return [] as ActivityDefinition[];
  }
}

export function saveActivityLocally(activity: ActivityDefinition) {
  if (!canUseStorage()) return activity;

  const current = loadStoredActivities();
  const remaining = current.filter((item) => item.slug !== activity.slug);
  const nextActivities = [activity, ...remaining];

  window.localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(nextActivities));
  return activity;
}

export function loadStoredChildPreferences() {
  if (!canUseStorage()) {
    return {} as Record<string, ChildThemePreferences>;
  }

  const raw = window.localStorage.getItem(CHILD_PREFS_KEY);
  if (!raw) return {} as Record<string, ChildThemePreferences>;

  try {
    return JSON.parse(raw) as Record<string, ChildThemePreferences>;
  } catch {
    return {} as Record<string, ChildThemePreferences>;
  }
}

export function saveChildPreferencesLocally(
  childId: string,
  preferences: ChildThemePreferences
) {
  if (!canUseStorage()) return preferences;

  const current = loadStoredChildPreferences();
  const next = {
    ...current,
    [childId]: preferences
  };

  window.localStorage.setItem(CHILD_PREFS_KEY, JSON.stringify(next));
  return preferences;
}

export function loadActiveChildId() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ACTIVE_CHILD_KEY);
}

export function saveActiveChildId(childId: string) {
  if (!canUseStorage()) return childId;
  window.localStorage.setItem(ACTIVE_CHILD_KEY, childId);
  return childId;
}

export function clearActiveChildId() {
  if (!canUseStorage()) return null;
  window.localStorage.removeItem(ACTIVE_CHILD_KEY);
  return null;
}

export function loadLocalParentAccounts() {
  if (!canUseStorage()) return [] as LocalParentAccount[];

  const raw = window.localStorage.getItem(LOCAL_PARENTS_KEY);
  if (!raw) return [] as LocalParentAccount[];

  try {
    return JSON.parse(raw) as LocalParentAccount[];
  } catch {
    return [] as LocalParentAccount[];
  }
}

export function saveLocalParentAccount(account: LocalParentAccount) {
  if (!canUseStorage()) return account;

  const current = loadLocalParentAccounts().filter(
    (item) => item.email !== account.email
  );
  const next = [account, ...current];
  window.localStorage.setItem(LOCAL_PARENTS_KEY, JSON.stringify(next));
  return account;
}

export function setCurrentLocalParent(parentId: string | null) {
  if (!canUseStorage()) return parentId;

  if (!parentId) {
    window.localStorage.removeItem(CURRENT_PARENT_KEY);
    return null;
  }

  window.localStorage.setItem(CURRENT_PARENT_KEY, parentId);
  return parentId;
}

export function loadCurrentLocalParent() {
  if (!canUseStorage()) return null;
  const parentId = window.localStorage.getItem(CURRENT_PARENT_KEY);
  if (!parentId) return null;

  const parent = loadLocalParentAccounts().find((item) => item.id === parentId);
  if (!parent) return null;

  return {
    id: parent.id,
    role: parent.role,
    email: parent.email,
    fullName: parent.fullName,
    phoneNumber: parent.phoneNumber,
    createdAt: parent.createdAt,
    updatedAt: parent.updatedAt
  } satisfies ParentProfile;
}

export function findLocalParentAccountByEmail(email: string) {
  return loadLocalParentAccounts().find((item) => item.email === email) ?? null;
}

export function loadLocalChildProfiles() {
  if (!canUseStorage()) return [] as ChildProfile[];

  const raw = window.localStorage.getItem(LOCAL_CHILDREN_KEY);
  if (!raw) return [] as ChildProfile[];

  try {
    return JSON.parse(raw) as ChildProfile[];
  } catch {
    return [] as ChildProfile[];
  }
}

export function saveLocalChildProfiles(children: ChildProfile[]) {
  if (!canUseStorage()) return children;
  window.localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(children));
  return children;
}
