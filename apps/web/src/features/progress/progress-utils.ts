import {
  buildChildSkillProgressList,
  calculateOverallLevel,
  getCurrentPracticeFocus,
  getNeedsPractice
} from "@/features/adaptive-learning/mastery";
import {
  deriveSkillAreasForActivity,
  getPrimarySkillArea,
  getSkillAreaLabel,
  getSkillLevelLabel
} from "@/features/adaptive-learning/skill-taxonomy";
import { sampleAttempts } from "@/lib/constants/sample-data";
import {
  formatDuration,
  getChildAge,
  getThemeMatchScore
} from "@/lib/utils/activity";
import { ActivityAttempt, ActivityDefinition, ChildProfile } from "@/types/activity";

export function mergeAttempts(extraAttempts: ActivityAttempt[]) {
  return [...extraAttempts, ...sampleAttempts].sort(
    (left, right) =>
      new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime()
  );
}

export function getAttemptsForChild(attempts: ActivityAttempt[], childId: string) {
  return attempts.filter((attempt) => attempt.childId === childId);
}

function buildLearningAreaBreakdown(attempts: ActivityAttempt[]) {
  const scoreMap = new Map<string, number[]>();

  for (const attempt of attempts) {
    for (const area of attempt.learningAreas) {
      const current = scoreMap.get(area) ?? [];
      const score =
        attempt.learningAreaScores[area] ??
        attempt.successRate ??
        attempt.score;
      scoreMap.set(area, [...current, score]);
    }
  }

  return Array.from(scoreMap.entries())
    .map(([area, scores]) => ({
      area,
      average: Math.round(
        scores.reduce((sum, value) => sum + value, 0) / scores.length
      )
    }))
    .sort((left, right) => right.average - left.average);
}

export function buildChildSnapshot(
  child: ChildProfile,
  attempts: ActivityAttempt[],
  activities: ActivityDefinition[]
) {
  const childAge = getChildAge(child);
  const childAttempts = getAttemptsForChild(attempts, child.id);
  const totalStars = childAttempts.reduce(
    (sum, attempt) => sum + attempt.starsEarned,
    0
  );
  const totalTimeSeconds = childAttempts.reduce(
    (sum, attempt) => sum + attempt.durationSeconds,
    0
  );
  const averageSuccessRate = childAttempts.length
    ? Math.round(
        childAttempts.reduce((sum, attempt) => sum + attempt.successRate, 0) /
          childAttempts.length
      )
    : 0;
  const averageDifficulty = childAttempts.length
    ? Number(
        (
          childAttempts.reduce(
            (sum, attempt) => sum + attempt.difficultySnapshot,
            0
          ) / childAttempts.length
        ).toFixed(1)
      )
    : 0;

  const skillProgress = buildChildSkillProgressList(child, childAttempts, activities);
  const overallLevel = calculateOverallLevel(skillProgress);
  const activePracticeFocus = getCurrentPracticeFocus(skillProgress);
  const needsPractice = getNeedsPractice(skillProgress);
  const strengths = [...skillProgress]
    .filter((item) => item.attemptsAtCurrentLevel > 0)
    .sort((left, right) => right.masteryScore - left.masteryScore)
    .slice(0, 3);
  const weakAreas = needsPractice.slice(0, 3);
  const learningAreaBreakdown = buildLearningAreaBreakdown(childAttempts);

  const recommended = activities
    .filter((activity) => childAge >= activity.ageMin && childAge <= activity.ageMax)
    .sort((left, right) => {
      const leftPrimarySkill = getPrimarySkillArea(left);
      const rightPrimarySkill = getPrimarySkillArea(right);
      const focusSkill = activePracticeFocus?.skillArea;
      const focusDelta =
        Number(rightPrimarySkill === focusSkill) - Number(leftPrimarySkill === focusSkill);
      if (focusDelta !== 0) return focusDelta;

      const leftWeakDelta = Number(
        needsPractice.some((item) => item.skillArea === leftPrimarySkill)
      );
      const rightWeakDelta = Number(
        needsPractice.some((item) => item.skillArea === rightPrimarySkill)
      );
      if (rightWeakDelta !== leftWeakDelta) {
        return rightWeakDelta - leftWeakDelta;
      }

      const levelDelta =
        (skillProgress.find((item) => item.skillArea === leftPrimarySkill)?.currentLevel ?? 1) -
        (skillProgress.find((item) => item.skillArea === rightPrimarySkill)?.currentLevel ?? 1);
      if (levelDelta !== 0) return levelDelta;

      return getThemeMatchScore(right, child) - getThemeMatchScore(left, child);
    })
    .slice(0, 3);

  return {
    child,
    totalAttempts: childAttempts.length,
    totalStars,
    totalTimeLabel: formatDuration(totalTimeSeconds),
    averageSuccessRate,
    averageDifficulty,
    overallLevel,
    overallLevelLabel: activePracticeFocus
      ? getSkillLevelLabel(activePracticeFocus.skillArea, activePracticeFocus.currentLevel)
      : `Level ${overallLevel} Explorer`,
    activePracticeFocus,
    currentPracticeReason: activePracticeFocus
      ? activePracticeFocus.status === "needs-support"
        ? `${child.displayName} is still building ${getSkillAreaLabel(activePracticeFocus.skillArea).toLowerCase()} at ${activePracticeFocus.levelLabel}.`
        : `${child.displayName} is practicing ${getSkillAreaLabel(activePracticeFocus.skillArea).toLowerCase()} at ${activePracticeFocus.levelLabel}.`
      : `${child.displayName} is ready for a fresh logic challenge.`,
    recentAttempts: childAttempts.slice(0, 4),
    strengths,
    weakAreas,
    needsPractice,
    skillProgress,
    learningAreaBreakdown,
    recommended: recommended.map((activity) => ({
      ...activity,
      skillAreas: activity.skillAreas ?? deriveSkillAreasForActivity(activity),
      primarySkillArea: activity.primarySkillArea ?? getPrimarySkillArea(activity)
    }))
  };
}
