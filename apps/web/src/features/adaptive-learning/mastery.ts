import {
  ActivityAttempt,
  ActivityType,
  ChildProfile,
  ChildSkillProgress,
  ChildSkillProgressStatus,
  LearningArea,
  SkillArea
} from "@/types/activity";
import {
  allSkillAreas,
  buildNextGoal,
  deriveSkillAreasForActivity,
  getPositiveSkillSummary,
  getPrimarySkillArea,
  getSkillAreaLabel,
  getSkillLevelLabel
} from "@/features/adaptive-learning/skill-taxonomy";

const MASTERED_SCORE = 82;
const READY_SCORE = 72;
const WEAKNESS_SCORE = 58;
const MIN_ATTEMPTS_FOR_MASTERY = 3;
const RECENT_WINDOW = 4;

function getAttemptSkillAreas(attempt: ActivityAttempt) {
  return attempt.skillAreas?.length
    ? attempt.skillAreas
    : buildSkillAreasForActivity({
        type: attempt.activityType,
        learningAreas: attempt.learningAreas,
        skillAreas: attempt.skillAreas,
        primarySkillArea: attempt.primarySkillArea
      });
}

function getAttemptsForSkill(
  attempts: ActivityAttempt[],
  skillArea: SkillArea
) {
  return attempts
    .filter((attempt) => getAttemptSkillAreas(attempt).includes(skillArea))
    .sort(
      (left, right) =>
        new Date(left.finishedAt).getTime() - new Date(right.finishedAt).getTime()
    );
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value);
}

function computeMasteryScore(attempts: ActivityAttempt[]) {
  if (attempts.length === 0) return 0;

  const avgSuccess = average(attempts.map((attempt) => attempt.successRate));
  const avgMistakes = average(attempts.map((attempt) => attempt.mistakesCount));
  const avgDuration = average(attempts.map((attempt) => attempt.durationSeconds));
  const completionRate =
    (attempts.filter((attempt) => attempt.completed).length / attempts.length) * 100;
  const durationScore =
    avgDuration <= 30 ? 100 : avgDuration <= 60 ? 88 : avgDuration <= 90 ? 76 : 62;
  const mistakePenalty = Math.min(18, avgMistakes * 8);

  return Math.max(
    0,
    round(avgSuccess * 0.55 + completionRate * 0.25 + durationScore * 0.2 - mistakePenalty)
  );
}

function getStatus(score: number, attemptsAtLevel: number): ChildSkillProgressStatus {
  if (attemptsAtLevel === 0) return "new";
  if (attemptsAtLevel >= MIN_ATTEMPTS_FOR_MASTERY && score >= MASTERED_SCORE) {
    return "mastered";
  }
  if (score < WEAKNESS_SCORE && attemptsAtLevel >= 2) {
    return "needs-support";
  }
  if (score >= READY_SCORE && attemptsAtLevel >= 2) {
    return "ready-to-advance";
  }
  return "practicing";
}

export function buildDefaultSkillProgress(
  childId: string,
  skillArea: SkillArea,
  level = 1
): ChildSkillProgress {
  return {
    childId,
    skillArea,
    currentLevel: level,
    masteryScore: 0,
    attemptsAtCurrentLevel: 0,
    successfulAttemptsAtCurrentLevel: 0,
    averageSuccessRate: 0,
    averageMistakes: 0,
    averageDurationSeconds: 0,
    weaknessScore: 0,
    status: "new",
    levelLabel: getSkillLevelLabel(skillArea, level),
    positiveSummary: getPositiveSkillSummary(skillArea, level),
    nextGoal: buildNextGoal(skillArea, level)
  };
}

export function evaluateSkillProgress(
  childId: string,
  skillArea: SkillArea,
  attempts: ActivityAttempt[]
) {
  const relevant = getAttemptsForSkill(attempts, skillArea);

  if (relevant.length === 0) {
    return buildDefaultSkillProgress(childId, skillArea);
  }

  const maxSeenLevel = Math.max(...relevant.map((attempt) => attempt.levelPlayed), 1);

  for (let level = 1; level <= maxSeenLevel + 1; level += 1) {
    const levelAttempts = relevant
      .filter((attempt) => attempt.levelPlayed === level)
      .slice(-RECENT_WINDOW);

    if (levelAttempts.length === 0) {
      return buildDefaultSkillProgress(childId, skillArea, level);
    }

    const masteryScore = computeMasteryScore(levelAttempts);
    const successfulAttempts = levelAttempts.filter((attempt) => attempt.completed).length;
    const avgSuccessRate = round(
      average(levelAttempts.map((attempt) => attempt.successRate))
    );
    const avgMistakes = Number(
      average(levelAttempts.map((attempt) => attempt.mistakesCount)).toFixed(1)
    );
    const avgDurationSeconds = round(
      average(levelAttempts.map((attempt) => attempt.durationSeconds))
    );
    const status = getStatus(masteryScore, levelAttempts.length);
    const mastered =
      levelAttempts.length >= MIN_ATTEMPTS_FOR_MASTERY && masteryScore >= MASTERED_SCORE;

    if (mastered && level <= maxSeenLevel) {
      continue;
    }

    return {
      childId,
      skillArea,
      currentLevel: mastered ? level + 1 : level,
      masteryScore,
      attemptsAtCurrentLevel: levelAttempts.length,
      successfulAttemptsAtCurrentLevel: successfulAttempts,
      averageSuccessRate: avgSuccessRate,
      averageMistakes: avgMistakes,
      averageDurationSeconds: avgDurationSeconds,
      weaknessScore: Math.max(0, 100 - masteryScore),
      status,
      lastPracticedAt: relevant[relevant.length - 1]?.finishedAt,
      levelLabel: getSkillLevelLabel(skillArea, mastered ? level + 1 : level),
      positiveSummary: getPositiveSkillSummary(skillArea, mastered ? level + 1 : level),
      nextGoal: mastered
        ? `Great progress. Start practicing ${getSkillAreaLabel(skillArea).toLowerCase()} at Level ${level + 1}.`
        : buildNextGoal(skillArea, level)
    } satisfies ChildSkillProgress;
  }

  return buildDefaultSkillProgress(childId, skillArea, maxSeenLevel + 1);
}

export function buildChildSkillProgressList(
  child: ChildProfile,
  attempts: ActivityAttempt[],
  activities: Array<{
    type: ActivityType;
    learningAreas: LearningArea[];
    skillAreas?: SkillArea[];
    primarySkillArea?: SkillArea;
  }>
) {
  const catalogSkillAreas = activities.flatMap((activity) =>
    buildSkillAreasForActivity(activity)
  );
  const activeSkillAreas = Array.from(
    new Set([
      ...catalogSkillAreas,
      ...attempts.flatMap((attempt) => attempt.skillAreas ?? []),
      ...allSkillAreas
    ])
  ) as SkillArea[];

  return activeSkillAreas
    .map((skillArea) => evaluateSkillProgress(child.id, skillArea, attempts))
    .sort((left, right) => right.masteryScore - left.masteryScore);
}

export function calculateOverallLevel(skillProgress: ChildSkillProgress[]) {
  const active = skillProgress.filter((progress) => progress.attemptsAtCurrentLevel > 0);
  if (active.length === 0) return 1;

  return Math.max(
    1,
    Math.round(
      active.reduce((sum, progress) => sum + progress.currentLevel, 0) / active.length
    )
  );
}

export function getCurrentPracticeFocus(skillProgress: ChildSkillProgress[]) {
  return [...skillProgress].sort((left, right) => {
    const statusDelta =
      Number(right.status === "needs-support") - Number(left.status === "needs-support");
    if (statusDelta !== 0) return statusDelta;
    return left.masteryScore - right.masteryScore;
  })[0] ?? null;
}

export function getNeedsPractice(skillProgress: ChildSkillProgress[]) {
  return skillProgress
    .filter(
      (progress) =>
        progress.status === "needs-support" || progress.status === "practicing"
    )
    .sort((left, right) => left.masteryScore - right.masteryScore)
    .slice(0, 3);
}

export function buildSkillAreasForActivity(activity: {
  type: ActivityAttempt["activityType"];
  learningAreas: ActivityAttempt["learningAreas"];
  skillAreas?: SkillArea[];
  primarySkillArea?: SkillArea;
}) {
  if (activity.skillAreas?.length) return activity.skillAreas;

  return deriveSkillAreasForActivity({
    id: "",
    templateId: "",
    templateKey: "shape-match",
    title: "",
    slug: "",
    type: activity.type,
    interactionType: "click-select",
    ageMin: 4,
    ageMax: 12,
    difficulty: 1,
    recommendedLevel: 1,
    learningAreas: activity.learningAreas,
    skillAreas: activity.skillAreas,
    primarySkillArea: activity.primarySkillArea,
    instructionsText: "",
    explanationText: "",
    funFact: "",
    defaultThemeId: "animals",
    supportedThemeIds: ["animals"],
    visualThemes: [],
    items: [],
    isPublished: true,
    createdAt: "",
    updatedAt: ""
  });
}

export function getPrimarySkillForActivity(activity: {
  type: ActivityType;
  learningAreas: LearningArea[];
  skillAreas?: SkillArea[];
  primarySkillArea?: SkillArea;
}) {
  return getPrimarySkillArea({
    id: "",
    templateId: "",
    templateKey: "shape-match",
    title: "",
    slug: "",
    type: activity.type,
    interactionType: "click-select",
    ageMin: 4,
    ageMax: 12,
    difficulty: 1,
    recommendedLevel: 1,
    learningAreas: activity.learningAreas,
    skillAreas: activity.skillAreas,
    primarySkillArea: activity.primarySkillArea,
    instructionsText: "",
    explanationText: "",
    funFact: "",
    defaultThemeId: "animals",
    supportedThemeIds: ["animals"],
    visualThemes: [],
    items: [],
    isPublished: true,
    createdAt: "",
    updatedAt: ""
  });
}
