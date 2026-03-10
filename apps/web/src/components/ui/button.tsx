import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const baseClassName =
  "inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClassName,
        variant === "primary" &&
          "bg-gradient-to-r from-[#ff8b5f] to-[#ff6e70] text-white shadow-playful hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(255,122,89,0.35)]",
        variant === "secondary" &&
          "bg-white/90 text-ink ring-1 ring-slate-200 hover:bg-white hover:-translate-y-0.5",
        variant === "ghost" && "bg-transparent text-ink hover:bg-white/60",
        props.disabled &&
          "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        baseClassName,
        variant === "primary" &&
          "bg-gradient-to-r from-[#ff8b5f] to-[#ff6e70] text-white shadow-playful hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(255,122,89,0.35)]",
        variant === "secondary" &&
          "bg-white/90 text-ink ring-1 ring-slate-200 hover:bg-white hover:-translate-y-0.5",
        variant === "ghost" && "bg-transparent text-ink hover:bg-white/60",
        className
      )}
    >
      {children}
    </Link>
  );
}
