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
    alt: string;
    bubbleClassName: string;
  }
> = {
  default: {
    alt: "Brainy mascot",
    bubbleClassName: "from-white to-[#ffe9ef] text-slate-700"
  },
  happy: {
    alt: "Brainy mascot smiling happily",
    bubbleClassName: "from-[#fff7d8] to-white text-orange-900"
  },
  thinking: {
    alt: "Brainy mascot thinking",
    bubbleClassName: "from-white to-[#e8f5ff] text-sky-900"
  },
  celebrating: {
    alt: "Brainy mascot celebrating",
    bubbleClassName: "from-[#fff1db] to-[#ffe6f6] text-pink-900"
  },
  excited: {
    alt: "Brainy mascot excited",
    bubbleClassName: "from-[#fff1db] to-[#ffe6f6] text-pink-900"
  },
  encouraging: {
    alt: "Brainy mascot encouraging a child",
    bubbleClassName: "from-white to-[#ecfff4] text-emerald-900"
  },
  teaching: {
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

function MascotOverlay({ state }: { state: MascotBrainState }) {
  if (state === "default") return null;

  if (state === "thinking") {
    return (
      <>
        <div className="absolute right-[12%] top-[7%] h-[8%] w-[8%] rounded-full border-[3px] border-[#11163D] bg-white" />
        <div className="absolute right-[1%] top-[-2%] flex h-[15%] w-[15%] items-center justify-center rounded-full border-[3px] border-[#11163D] bg-white text-[40%] font-black text-[#11163D]">
          ?
        </div>
      </>
    );
  }

  if (state === "celebrating" || state === "excited") {
    return (
      <>
        <div className="absolute left-[4%] top-[10%] text-[120%]">✨</div>
        <div className="absolute right-[2%] top-[14%] text-[110%]">🎉</div>
        <div className="absolute left-[18%] top-[-2%] text-[100%]">⭐</div>
        <div className="absolute right-[16%] top-[-1%] text-[95%]">✨</div>
      </>
    );
  }

  if (state === "encouraging") {
    return (
      <>
        <div className="absolute -left-[4%] top-[34%] flex h-[28%] w-[40%] items-center justify-center rounded-[1rem] border-[3px] border-[#11163D] bg-white text-[95%] shadow-md">
          <span className="text-[#66D4AE]">✓</span>
        </div>
        <div className="absolute right-[8%] top-[48%] text-[110%]">💗</div>
      </>
    );
  }

  if (state === "teaching") {
    return (
      <>
        <div className="absolute right-[-6%] top-[40%] h-[24%] w-[34%] rounded-[1rem] border-[3px] border-[#11163D] bg-white shadow-md">
          <div className="absolute left-[14%] top-[28%] h-[7%] w-[58%] rounded-full bg-[#7AC7FF]" />
          <div className="absolute left-[14%] top-[48%] h-[7%] w-[38%] rounded-full bg-[#FFC83D]" />
        </div>
        <div className="absolute right-[17%] top-[36%] h-[10%] w-[2.6%] rotate-[40deg] rounded-full bg-[#11163D]" />
        <div className="absolute right-[15%] top-[33%] h-[7%] w-[7%] rounded-full border-[3px] border-[#11163D] bg-[#FFC83D]" />
      </>
    );
  }

  if (state === "happy") {
    return (
      <>
        <div className="absolute left-[0%] top-[12%] text-[100%]">✨</div>
        <div className="absolute right-[1%] top-[12%] text-[100%]">🌸</div>
      </>
    );
  }

  return null;
}

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
          src="/mascot/brainy-mascot.png"
          alt={meta.alt}
          width={1024}
          height={1536}
          className="h-auto w-full drop-shadow-[0_16px_30px_rgba(16,33,58,0.18)]"
          sizes="(max-width: 768px) 30vw, 200px"
          priority={size === "lg" || size === "xl"}
        />
        <MascotOverlay state={state} />
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
