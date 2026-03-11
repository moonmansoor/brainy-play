"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const sizeClassName = {
  sm: "w-28 sm:w-32",
  md: "w-36 sm:w-44 lg:w-52",
  lg: "w-44 sm:w-56 lg:w-64"
} as const;

export function BrandLogo({
  size = "md",
  className,
  priority = false,
  linked = false
}: {
  size?: keyof typeof sizeClassName;
  className?: string;
  priority?: boolean;
  linked?: boolean;
}) {
  const image = (
    <div className={cn("relative", sizeClassName[size], className)}>
      <Image
        src={size === "sm" ? "/brand/brainy-play-logo-small.png" : "/brand/brainy-play-logo.png"}
        alt="Brainy Play logo"
        width={1024}
        height={1024}
        priority={priority}
        className="h-auto w-full object-contain"
        sizes={
          size === "lg"
            ? "(max-width: 640px) 176px, (max-width: 1024px) 224px, 256px"
            : size === "md"
              ? "(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px"
              : "(max-width: 640px) 112px, 128px"
        }
      />
    </div>
  );

  if (!linked) return image;

  return (
    <Link href="/" aria-label="Brainy Play home" className="block">
      {image}
    </Link>
  );
}
