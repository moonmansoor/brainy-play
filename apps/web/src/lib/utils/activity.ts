import { themePacks } from "@/lib/constants/sample-data";
import {
  buildLearningAreaScores,
  getDifficultyForLevel
} from "@/features/activities/template-registry";
import {
  evaluateSkillProgress,
  getNeedsPractice
} from "@/features/adaptive-learning/mastery";
import {
  AdaptiveActivitySession,
  ActivityAttempt,
  ActivityCompletionPayload,
  ActivityDefinition,
  ActivityOutcome,
  ActivityType,
  AvatarStyle,
  ChildProfile,
  ChildThemePreferences,
  RewardStyle,
  ShapeKind,
  ThemeId
} from "@/types/activity";

export function getActivityTypeLabel(type: ActivityType) {
  switch (type) {
    case "shape-match":
      return "Shape Match";
    case "count-objects":
      return "Count the Objects";
    case "pattern-complete":
      return "Pattern Builder";
    case "odd-one-out":
      return "Odd One Out";
    case "sequence-order":
      return "Story Sequence";
    case "sort-game":
      return "Logic Sorting";
    case "memory-cards":
      return "Memory Cards";
    case "logic-game":
      return "Logic Game";
    case "maze-path":
      return "Maze Direction";
    case "connect-logic":
      return "Connect The Logic";
    case "code-blocks":
      return "Code Blocks Thinking";
    case "word-builder":
      return "Word Builder";
    default:
      return "Activity";
  }
}

export function getShapeName(shape: ShapeKind) {
  switch (shape) {
    case "circle":
      return "Circle";
    case "square":
      return "Square";
    case "triangle":
      return "Triangle";
    case "star":
      return "Star";
  }
}

export function calculateStars(score: number) {
  if (score >= 95) return 3;
  if (score >= 75) return 2;
  if (score >= 50) return 1;
  return 0;
}

export function buildOutcome(
  isCorrect: boolean,
  mistakesCount: number,
  durationSeconds: number,
  options?: {
    correctAnswersCount?: number;
    totalQuestions?: number;
  }
): ActivityOutcome {
  const baseScore = isCorrect ? 100 : 35;
  const penalty = mistakesCount * 10;
  const score = Math.max(10, baseScore - penalty);
  const correctAnswersCount = options?.correctAnswersCount ?? (isCorrect ? 1 : 0);
  const totalQuestions = Math.max(1, options?.totalQuestions ?? 1);
  const successRate = Math.round((correctAnswersCount / totalQuestions) * 100);

  return {
    isCorrect,
    score,
    successRate,
    correctAnswersCount,
    totalQuestions,
    starsEarned: calculateStars(score),
    mistakesCount,
    completed: isCorrect,
    durationSeconds
  };
}

export function buildSessionOutcome(outcomes: ActivityOutcome[]) {
  const completedCount = outcomes.filter((outcome) => outcome.completed).length;
  const totalScore = outcomes.reduce((sum, outcome) => sum + outcome.score, 0);
  const totalMistakes = outcomes.reduce(
    (sum, outcome) => sum + outcome.mistakesCount,
    0
  );
  const totalDuration = outcomes.reduce(
    (sum, outcome) => sum + outcome.durationSeconds,
    0
  );
  const totalCorrectAnswers = outcomes.reduce(
    (sum, outcome) => sum + outcome.correctAnswersCount,
    0
  );
  const totalQuestions = outcomes.reduce(
    (sum, outcome) => sum + outcome.totalQuestions,
    0
  );
  const averageScore = outcomes.length
    ? Math.round(totalScore / outcomes.length)
    : 0;

  return {
    isCorrect: completedCount === outcomes.length && outcomes.length > 0,
    score: averageScore,
    successRate: Math.round((totalCorrectAnswers / Math.max(1, totalQuestions)) * 100),
    correctAnswersCount: totalCorrectAnswers,
    totalQuestions,
    starsEarned: calculateStars(averageScore),
    mistakesCount: totalMistakes,
    completed: completedCount === outcomes.length && outcomes.length > 0,
    durationSeconds: totalDuration
  } satisfies ActivityOutcome;
}

export function buildAttemptPayload(input: {
  child: ChildProfile;
  activity: ActivityDefinition;
  outcome: ActivityOutcome;
  startedAt: string;
  finishedAt: string;
  session?: AdaptiveActivitySession;
  priorAttempts?: ActivityAttempt[];
}): ActivityCompletionPayload {
  const difficultySnapshot = Math.max(
    input.activity.difficulty,
    getDifficultyForLevel(input.session?.currentLevel ?? input.activity.recommendedLevel)
  );
  const levelPlayed = input.session?.currentLevel ?? input.activity.recommendedLevel;
  const skillAreas = input.session?.skillAreas ?? input.activity.skillAreas ?? [];
  const primarySkillArea =
    input.session?.skillArea ?? input.activity.primarySkillArea ?? skillAreas[0];
  const learningAreaScores = buildLearningAreaScores(
    input.activity.learningAreas,
    input.outcome.successRate
  );
  const skillAreaScores =
    skillAreas.length > 0
      ? skillAreas.reduce((scores, area) => ({ ...scores, [area]: input.outcome.successRate }), {})
      : undefined;
  const draftAttempt: ActivityAttempt = {
    id: input.session?.taskInstance.id ?? "draft-attempt",
    childId: input.child.id,
    activityId: input.activity.id,
    activityType: input.activity.type,
    interactionType: input.activity.interactionType,
    learningAreas: input.activity.learningAreas,
    skillAreas,
    primarySkillArea,
    sessionId: input.session?.sessionId,
    taskInstanceId: input.session?.taskInstance.id,
    generatorSeed: input.session?.taskInstance.generatorSeed,
    levelPlayed,
    difficultySnapshot,
    score: input.outcome.score,
    successRate: input.outcome.successRate,
    correctAnswersCount: input.outcome.correctAnswersCount,
    totalQuestions: input.outcome.totalQuestions,
    starsEarned: input.outcome.starsEarned,
    completed: input.outcome.completed,
    hintsUsed: 0,
    mistakesCount: input.outcome.mistakesCount,
    durationSeconds: input.outcome.durationSeconds,
    explanationText: input.session?.explanationText ?? input.activity.explanationText,
    funFact: input.session?.funFact ?? input.activity.funFact,
    learningAreaScores,
    skillAreaScores,
    masteryLevelBefore: input.session?.masteryBefore.currentLevel,
    masteryScoreBefore: input.session?.masteryBefore.masteryScore,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt
  };
  const attemptsForMastery = [...(input.priorAttempts ?? []), draftAttempt];
  const masteryAfter =
    primarySkillArea
      ? evaluateSkillProgress(input.child.id, primarySkillArea, attemptsForMastery)
      : undefined;
  const needsMorePractice = getNeedsPractice(
    primarySkillArea && masteryAfter
      ? [masteryAfter]
      : []
  ).map((progress) => progress.skillArea);

  return {
    childId: input.child.id,
    activityId: input.activity.id,
    activityType: input.activity.type,
    interactionType: input.activity.interactionType,
    learningAreas: input.activity.learningAreas,
    skillAreas,
    primarySkillArea,
    sessionId: input.session?.sessionId,
    taskInstance: input.session?.taskInstance,
    taskInstanceId: input.session?.taskInstance.id,
    generatorSeed: input.session?.taskInstance.generatorSeed,
    levelPlayed,
    difficultySnapshot,
    score: input.outcome.score,
    successRate: input.outcome.successRate,
    correctAnswersCount: input.outcome.correctAnswersCount,
    totalQuestions: input.outcome.totalQuestions,
    starsEarned: input.outcome.starsEarned,
    completed: input.outcome.completed,
    hintsUsed: 0,
    mistakesCount: input.outcome.mistakesCount,
    durationSeconds: input.outcome.durationSeconds,
    explanationText: input.session?.explanationText ?? input.activity.explanationText,
    funFact: input.session?.funFact ?? input.activity.funFact,
    learningAreaScores,
    skillAreaScores,
    masteryLevelBefore: input.session?.masteryBefore.currentLevel,
    masteryLevelAfter: masteryAfter?.currentLevel,
    masteryScoreBefore: input.session?.masteryBefore.masteryScore,
    masteryScoreAfter: masteryAfter?.masteryScore,
    levelAdvanced:
      masteryAfter !== undefined &&
      input.session !== undefined &&
      masteryAfter.currentLevel > input.session.masteryBefore.currentLevel,
    needsMorePractice,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt
  };
}

export function getChildAge(child: ChildProfile, today = new Date()) {
  const birthDate = new Date(child.birthDate);
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - birthDate.getUTCMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  return Math.max(0, age);
}

export function isAgeMatch(activity: ActivityDefinition, childAge: number) {
  return childAge >= activity.ageMin && childAge <= activity.ageMax;
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function formatDifficulty(difficulty: number) {
  return `Level ${difficulty}`;
}

export function getThemePack(themeId: ThemeId) {
  return themePacks.find((theme) => theme.id === themeId) ?? themePacks[0];
}

export function getChildThemePreferences(child: ChildProfile | null | undefined) {
  const fallback = {
    favoriteThemes: ["animals"] as ThemeId[],
    favoriteColor: getThemePack("animals").accent,
    preferredRewardStyle: "sparkles" as RewardStyle,
    preferredAvatarStyle: "dreamer" as AvatarStyle
  };

  if (!child?.themePreferences) return fallback;

  return {
    favoriteThemes:
      child.themePreferences.favoriteThemes.length > 0
        ? child.themePreferences.favoriteThemes
        : fallback.favoriteThemes,
    favoriteColor: child.themePreferences.favoriteColor ?? fallback.favoriteColor,
    preferredRewardStyle:
      child.themePreferences.preferredRewardStyle ?? fallback.preferredRewardStyle,
    preferredAvatarStyle:
      child.themePreferences.preferredAvatarStyle ?? fallback.preferredAvatarStyle
  };
}

export function getPreferredThemeId(activity: ActivityDefinition, child: ChildProfile) {
  const preferences = getChildThemePreferences(child);
  const matchedTheme = preferences.favoriteThemes.find((themeId) =>
    activity.supportedThemeIds.includes(themeId)
  );

  return matchedTheme ?? activity.defaultThemeId;
}

export function getActivityVisualTheme(
  activity: ActivityDefinition,
  child?: ChildProfile | null
) {
  const themeId = child ? getPreferredThemeId(activity, child) : activity.defaultThemeId;

  return (
    activity.visualThemes.find((theme) => theme.themeId === themeId) ??
    activity.visualThemes.find((theme) => theme.themeId === activity.defaultThemeId) ??
    activity.visualThemes[0]
  );
}

export function getThemeMatchScore(activity: ActivityDefinition, child: ChildProfile) {
  const preferences = getChildThemePreferences(child);
  return preferences.favoriteThemes.reduce((score, themeId, index) => {
    if (!activity.supportedThemeIds.includes(themeId)) return score;
    return score + (preferences.favoriteThemes.length - index) * 10;
  }, 0);
}

export function mergeChildPreferences(
  child: ChildProfile,
  preferences?: ChildThemePreferences
) {
  if (!preferences) return child;

  return {
    ...child,
    themePreferences: preferences
  };
}

export function getRewardHeadline(style: RewardStyle) {
  switch (style) {
    case "sparkles":
      return "Sparkle burst unlocked";
    case "badges":
      return "Badge power unlocked";
    case "stickers":
      return "Sticker party unlocked";
  }
}
