import { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function Panel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/70 bg-card p-6 shadow-playful backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
