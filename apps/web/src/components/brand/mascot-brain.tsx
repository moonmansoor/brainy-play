"use client";

import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type MascotBrainState =
  | "default"
  | "happy"
  | "thinking"
  | "celebrating"
  | "excited"
  | "encouraging"
  | "teaching";

type MascotAnimation = "none" | "float" | "bounce" | "sparkle";

const stateMeta: Record<
  MascotBrainState,
  {
    src: string;
    alt: string;
    bubbleClassName: string;
  }
> = {
  default: {
    src: "/assets/mascot/brainy-default.svg",
    alt: "Brainy mascot",
    bubbleClassName: "from-white to-[#ffe9ef] text-slate-700"
  },
  happy: {
    src: "/assets/mascot/brainy-happy.svg",
    alt: "Brainy mascot smiling happily",
    bubbleClassName: "from-[#fff7d8] to-white text-orange-900"
  },
  thinking: {
    src: "/assets/mascot/brainy-thinking.svg",
    alt: "Brainy mascot thinking",
    bubbleClassName: "from-white to-[#e8f5ff] text-sky-900"
  },
  celebrating: {
    src: "/assets/mascot/brainy-celebrate.svg",
    alt: "Brainy mascot celebrating",
    bubbleClassName: "from-[#fff1db] to-[#ffe6f6] text-pink-900"
  },
  excited: {
    src: "/assets/mascot/brainy-celebrate.svg",
    alt: "Brainy mascot excited",
    bubbleClassName: "from-[#fff1db] to-[#ffe6f6] text-pink-900"
  },
  encouraging: {
    src: "/assets/mascot/brainy-encourage.svg",
    alt: "Brainy mascot encouraging a child",
    bubbleClassName: "from-white to-[#ecfff4] text-emerald-900"
  },
  teaching: {
    src: "/assets/mascot/brainy-teaching.svg",
    alt: "Brainy mascot teaching",
    bubbleClassName: "from-white to-[#eef2ff] text-indigo-900"
  }
};

const sizeClassName = {
  xs: "w-14",
  sm: "w-24",
  md: "w-36",
  lg: "w-48",
  xl: "w-60"
} as const;

const animationClassName: Record<MascotAnimation, string> = {
  none: "",
  float: "animate-mascot-float",
  bounce: "animate-mascot-bounce",
  sparkle: "animate-mascot-sparkle"
};

export function MascotBrain({
  state = "default",
  message,
  animation = "none",
  size = "md",
  className,
  imageClassName,
  messageClassName,
  reverse = false
}: {
  state?: MascotBrainState;
  message?: string;
  animation?: MascotAnimation;
  size?: keyof typeof sizeClassName;
  className?: string;
  imageClassName?: string;
  messageClassName?: string;
  reverse?: boolean;
}) {
  const meta = stateMeta[state];

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        reverse && "flex-row-reverse",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0",
          sizeClassName[size],
          animationClassName[animation],
          imageClassName
        )}
      >
        <Image
          src={meta.src}
          alt={meta.alt}
          width={512}
          height={512}
          className="h-auto w-full drop-shadow-[0_16px_30px_rgba(16,33,58,0.18)]"
          sizes="(max-width: 768px) 30vw, 200px"
        />
      </div>
      {message ? (
        <div
          className={cn(
            "max-w-sm rounded-[1.5rem] border border-white/80 bg-gradient-to-br px-4 py-3 text-sm font-semibold shadow-playful",
            meta.bubbleClassName,
            messageClassName
          )}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
