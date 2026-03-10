import Image from "next/image";

import { Panel } from "@/components/ui/panel";
import { getRewardHeadline } from "@/lib/utils/activity";
import { RewardStyle } from "@/types/activity";

export function RewardStrip({
  stars,
  rewardStyle,
  message
}: {
  stars: number;
  rewardStyle: RewardStyle;
  message: string;
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
