import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { ThemePack } from "@/types/activity";

export function ThemeChip({
  theme,
  active,
  compact = false
}: {
  theme: ThemePack;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border bg-white/80 p-3 shadow-sm transition",
        active
          ? "border-white ring-4 ring-white/70"
          : "border-white/60 hover:-translate-y-0.5",
        compact && "p-2"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-[1rem]">
          <Image
            src={theme.imageUrl}
            alt={theme.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">{theme.name}</p>
          {!compact ? (
            <p className="text-xs leading-5 text-slate-600">{theme.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
