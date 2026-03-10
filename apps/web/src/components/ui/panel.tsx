import { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function Panel({
  children,
  className,
  ...props
}: {
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/70 bg-card p-6 shadow-playful backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
