import {
  BRAINY_COIN_RULES,
  FREE_PLAY_LEVEL_LIMIT,
  rewardCatalog
} from "@/lib/constants/game-economy";
import {
  ActivityAttempt,
  ActivityCompletionPayload,
  ActivityDefinition,
  ChildProgress,
  RewardDefinition,
  UserSubscription
} from "@/types/activity";

type AttemptLike = Pick<
  ActivityAttempt | ActivityCompletionPayload,
  "completed" | "correctAnswersCount" | "finishedAt"
>;

export type ActivityAccessState = {
  status: "playable" | "locked-level" | "locked-premium";
  isPlayable: boolean;
  isPremiumOnly: boolean;
  hasReachedLevel: boolean;
  requiredLevel: number;
  currentLevel: number;
  freeLevelLimit: number;
};

export type BrainyCoinAwardBreakdown = {
  correctAnswerCoins: number;
  activityCompletionBonusCoins: number;
  levelUpBonusCoins: number;
  total: number;
};

export type AttemptProgressionResult = {
  previousLevel: number;
  nextLevel: number;
  didLevelUp: boolean;
  brainyCoinsEarned: number;
  awardBreakdown: BrainyCoinAwardBreakdown;
  nextProgress: ChildProgress;
  unlockedRewardDefinitions: RewardDefinition[];
};

export function createInitialChildProgress(childId: string): ChildProgress {
  const timestamp = new Date().toISOString();

  return {
    childId,
    currentLevel: 1,
    brainyCoinsBalance: 0,
    totalBrainyCoinsEarned: 0,
    totalCorrectAnswers: 0,
    totalCompletedActivities: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function getActivityRequiredLevel(activity: Pick<ActivityDefinition, "requiredLevel">) {
  return Math.max(1, activity.requiredLevel ?? 1);
}

export function normalizeCorrectAnswersCount(
  attempt: Partial<Pick<ActivityAttempt, "correctAnswersCount" | "completed">>,
  activity?: {
    items: Array<unknown>;
  }
) {
  if (typeof attempt.correctAnswersCount === "number") {
    return Math.max(0, attempt.correctAnswersCount);
  }

  if (attempt.completed && activity) {
    return activity.items.length;
  }

  return 0;
}

export function isSubscriptionActive(
  subscription: UserSubscription | null | undefined,
  now = new Date()
) {
  if (!subscription) return false;
  if (!["active", "trialing"].includes(subscription.status)) return false;

  if (subscription.endsAt) {
    return new Date(subscription.endsAt).getTime() >= now.getTime();
  }

  return true;
}

export function evaluateActivityAccess(input: {
  activity: Pick<ActivityDefinition, "requiredLevel">;
  progress: Pick<ChildProgress, "currentLevel"> | null | undefined;
  subscription: UserSubscription | null | undefined;
}) {
  const requiredLevel = getActivityRequiredLevel(input.activity);
  const currentLevel = Math.max(1, input.progress?.currentLevel ?? 1);
  const hasReachedLevel = currentLevel >= requiredLevel;
  const isPremiumOnly =
    requiredLevel > FREE_PLAY_LEVEL_LIMIT &&
    currentLevel >= FREE_PLAY_LEVEL_LIMIT &&
    !isSubscriptionActive(input.subscription);

  return {
    status: isPremiumOnly
      ? "locked-premium"
      : hasReachedLevel
        ? "playable"
        : "locked-level",
    isPlayable: hasReachedLevel && !isPremiumOnly,
    isPremiumOnly,
    hasReachedLevel,
    requiredLevel,
    currentLevel,
    freeLevelLimit: FREE_PLAY_LEVEL_LIMIT
  } satisfies ActivityAccessState;
}

export function calculateBrainyCoinAward(input: {
  correctAnswersCount: number;
  completed: boolean;
  didLevelUp: boolean;
}) {
  const correctAnswerCoins =
    input.correctAnswersCount * BRAINY_COIN_RULES.correctAnswer;
  const activityCompletionBonusCoins = input.completed
    ? BRAINY_COIN_RULES.activityCompletionBonus
    : 0;
  const levelUpBonusCoins = input.didLevelUp
    ? BRAINY_COIN_RULES.levelUpBonus
    : 0;

  return {
    correctAnswerCoins,
    activityCompletionBonusCoins,
    levelUpBonusCoins,
    total:
      correctAnswerCoins + activityCompletionBonusCoins + levelUpBonusCoins
  } satisfies BrainyCoinAwardBreakdown;
}

export function applyAttemptToProgress(input: {
  childId: string;
  progress: ChildProgress | null | undefined;
  activity: Pick<ActivityDefinition, "requiredLevel"> & {
    items: Array<unknown>;
  };
  attempt: AttemptLike;
  existingUnlockCodes?: string[];
  rewardDefinitions?: RewardDefinition[];
}) {
  const progress = input.progress ?? createInitialChildProgress(input.childId);
  const previousLevel = Math.max(1, progress.currentLevel);
  const nextLevel = input.attempt.completed
    ? Math.max(previousLevel, getActivityRequiredLevel(input.activity) + 1)
    : previousLevel;
  const didLevelUp = nextLevel > previousLevel;
  const correctAnswersCount = normalizeCorrectAnswersCount(
    input.attempt,
    input.activity
  );
  const awardBreakdown = calculateBrainyCoinAward({
    correctAnswersCount,
    completed: input.attempt.completed,
    didLevelUp
  });
  const nextProgress: ChildProgress = {
    ...progress,
    childId: input.childId,
    currentLevel: nextLevel,
    brainyCoinsBalance: progress.brainyCoinsBalance + awardBreakdown.total,
    totalBrainyCoinsEarned:
      progress.totalBrainyCoinsEarned + awardBreakdown.total,
    totalCorrectAnswers: progress.totalCorrectAnswers + correctAnswersCount,
    totalCompletedActivities:
      progress.totalCompletedActivities + (input.attempt.completed ? 1 : 0),
    lastActivityAt: input.attempt.finishedAt,
    createdAt: progress.createdAt ?? input.attempt.finishedAt,
    updatedAt: input.attempt.finishedAt
  };
  const existingUnlockCodes = new Set(input.existingUnlockCodes ?? []);
  const unlockedRewardDefinitions = (
    input.rewardDefinitions ?? rewardCatalog
  ).filter(
    (reward) =>
      nextProgress.totalBrainyCoinsEarned >= reward.requiredBrainyCoins &&
      !existingUnlockCodes.has(reward.code)
  );

  return {
    previousLevel,
    nextLevel,
    didLevelUp,
    brainyCoinsEarned: awardBreakdown.total,
    awardBreakdown,
    nextProgress,
    unlockedRewardDefinitions
  } satisfies AttemptProgressionResult;
}

export function deriveProgressFromAttempts(input: {
  childId: string;
  attempts: Array<Partial<ActivityAttempt>>;
  activities: ActivityDefinition[];
  existingUnlockCodes?: string[];
  rewardDefinitions?: RewardDefinition[];
}) {
  const activityById = new Map(
    input.activities.map((activity) => [activity.id, activity] as const)
  );
  const sortedAttempts = [...input.attempts].sort((left, right) => {
    const leftTime = new Date(left.finishedAt ?? 0).getTime();
    const rightTime = new Date(right.finishedAt ?? 0).getTime();
    return leftTime - rightTime;
  });

  let progress = createInitialChildProgress(input.childId);
  let unlockCodes = [...(input.existingUnlockCodes ?? [])];

  for (const attempt of sortedAttempts) {
    if (!attempt.activityId || !attempt.finishedAt) continue;

    const activity = activityById.get(attempt.activityId);
    if (!activity) continue;

    const result = applyAttemptToProgress({
      childId: input.childId,
      progress,
      activity,
      attempt: {
        completed: Boolean(attempt.completed),
        correctAnswersCount: normalizeCorrectAnswersCount(attempt, activity),
        finishedAt: attempt.finishedAt
      },
      existingUnlockCodes: unlockCodes,
      rewardDefinitions: input.rewardDefinitions
    });

    progress = result.nextProgress;
    unlockCodes = [
      ...unlockCodes,
      ...result.unlockedRewardDefinitions.map((reward) => reward.code)
    ];
  }

  return {
    progress,
    unlockCodes
  };
}
