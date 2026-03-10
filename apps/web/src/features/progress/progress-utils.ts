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
  ChildProfile
} from "@/types/activity";

export function mergeAttempts(extraAttempts: ActivityAttempt[]) {
  const byFingerprint = new Map<string, ActivityAttempt>();

  for (const attempt of [...extraAttempts, ...sampleAttempts]) {
    const fingerprint = [
      attempt.childId,
      attempt.activityId,
      attempt.startedAt,
      attempt.finishedAt,
      attempt.score
    ].join(":");

    if (!byFingerprint.has(fingerprint)) {
      byFingerprint.set(fingerprint, attempt);
    }
  }

  return Array.from(byFingerprint.values()).sort(
    (left, right) =>
      new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime()
  );
}

export function getAttemptsForChild(attempts: ActivityAttempt[], childId: string) {
  return attempts.filter((attempt) => attempt.childId === childId);
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

  const recommended = activities
    .filter(
      (activity) =>
        childAge >= activity.ageMin &&
        childAge <= activity.ageMax &&
        !childAttempts.some((attempt) => attempt.activityId === activity.id)
    )
    .sort((left, right) => getThemeMatchScore(right, child) - getThemeMatchScore(left, child))
    .slice(0, 2);

  return {
    child,
    totalAttempts: childAttempts.length,
    totalStars,
    totalTimeLabel: formatDuration(totalTimeSeconds),
    recentAttempts: childAttempts.slice(0, 4),
    strengths,
    weakAreas,
    recommended
  };
}
