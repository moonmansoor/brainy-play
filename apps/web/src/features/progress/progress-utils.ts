import { sampleAttempts } from "@/lib/constants/sample-data";
import {
  formatDuration,
  getActivityTypeLabel,
  getChildAge,
  getThemeMatchScore
} from "@/lib/utils/activity";
import {
  ActivityAttempt,
  ActivityDefinition,
  ChildProfile,
  LearningArea
} from "@/types/activity";

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
  const scoreMap = new Map<LearningArea, number[]>();

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

  const activityTypeScores = activities.map((activity) => {
    const related = childAttempts.filter(
      (attempt) => attempt.activityId === activity.id
    );
    const average =
      related.length > 0
        ? Math.round(
            related.reduce((sum, attempt) => sum + attempt.score, 0) /
              related.length
          )
        : 0;

    return {
      type: getActivityTypeLabel(activity.type),
      average
    };
  });

  const strengths = activityTypeScores
    .filter((item) => item.average > 0)
    .sort((left, right) => right.average - left.average)
    .slice(0, 2);

  const weakAreas = activityTypeScores
    .filter((item) => item.average > 0)
    .sort((left, right) => left.average - right.average)
    .slice(0, 2);

  const learningAreaBreakdown = buildLearningAreaBreakdown(childAttempts);

  const recommended = activities
    .filter(
      (activity) =>
        childAge >= activity.ageMin &&
        childAge <= activity.ageMax &&
        !childAttempts.some((attempt) => attempt.activityId === activity.id)
    )
    .sort(
      (left, right) => getThemeMatchScore(right, child) - getThemeMatchScore(left, child)
    )
    .slice(0, 3);

  return {
    child,
    totalAttempts: childAttempts.length,
    totalStars,
    totalTimeLabel: formatDuration(totalTimeSeconds),
    averageSuccessRate,
    averageDifficulty,
    recentAttempts: childAttempts.slice(0, 4),
    strengths,
    weakAreas,
    learningAreaBreakdown,
    recommended
  };
}
