import { RewardDefinition, SubscriptionPlanType } from "@/types/activity";

export const BRAINY_COIN_LABEL = "Brainy Coins";

export const FREE_PLAY_LEVEL_LIMIT = 5;

export const DEFAULT_PREMIUM_PLAN: SubscriptionPlanType = "premium-monthly";

export const BRAINY_COIN_RULES = {
  correctAnswer: 10,
  activityCompletionBonus: 20,
  levelUpBonus: 15
} as const;

export const rewardCatalog: RewardDefinition[] = [
  {
    id: "reward-mini-game",
    code: "mini-game-unlock",
    title: "Mini Game Unlock",
    description: "Unlock a bonus mini game after earning 50 Brainy Coins.",
    requiredBrainyCoins: 50,
    rewardType: "mini-game",
    metadata: {
      icon: "gamepad",
      theme: "bonus-play"
    }
  },
  {
    id: "reward-new-avatar",
    code: "new-avatar",
    title: "New Avatar",
    description: "Unlock a fresh avatar style after earning 100 Brainy Coins.",
    requiredBrainyCoins: 100,
    rewardType: "avatar",
    metadata: {
      icon: "avatar",
      avatarStyle: "explorer"
    }
  },
  {
    id: "reward-junior-coder-certificate",
    code: "junior-coder-certificate",
    title: "Junior Coder Certificate",
    description: "Celebrate a big milestone after earning 500 Brainy Coins.",
    requiredBrainyCoins: 500,
    rewardType: "certificate",
    metadata: {
      icon: "certificate",
      printable: true
    }
  }
];
