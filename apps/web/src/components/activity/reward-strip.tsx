import Image from "next/image";

import { Panel } from "@/components/ui/panel";
import { BRAINY_COIN_LABEL } from "@/lib/constants/game-economy";
import { getRewardHeadline } from "@/lib/utils/activity";
import { RewardDefinition, RewardStyle } from "@/types/activity";

export function RewardStrip({
  stars,
  rewardStyle,
  message,
  brainyCoinsEarned,
  currentBalance,
  didLevelUp,
  unlockedRewards
}: {
  stars: number;
  rewardStyle: RewardStyle;
  message: string;
  brainyCoinsEarned: number;
  currentBalance: number;
  didLevelUp?: boolean;
  unlockedRewards?: RewardDefinition[];
}) {
  return (
    <Panel className="overflow-hidden bg-gradient-to-r from-[#fff2c3] via-[#ffe3c4] to-[#ffe4f1]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-700">
            {getRewardHeadline(rewardStyle)}
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold">{message}</h3>
          <div className="mt-3 flex items-center gap-2 text-2xl">
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index}>{index < stars ? "⭐" : "☆"}</span>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            +{brainyCoinsEarned} {BRAINY_COIN_LABEL}. Balance: {currentBalance}
          </p>
          {didLevelUp ? (
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              Level up unlocked the next adventure.
            </p>
          ) : null}
          {unlockedRewards?.length ? (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Unlocked: {unlockedRewards.map((reward) => reward.title).join(", ")}
            </p>
          ) : null}
        </div>
        <div className="relative h-24 w-24 shrink-0">
          <Image
            src={rewardStyle === "badges" ? "/images/rewards/badge-ribbon.svg" : "/images/rewards/star-burst.svg"}
            alt="Reward"
            fill
            sizes="96px"
          />
        </div>
      </div>
    </Panel>
  );
}
