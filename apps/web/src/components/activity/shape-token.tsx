import { CSSProperties } from "react";

import { ShapeKind } from "@/types/activity";

function shapeClass(shape: ShapeKind) {
  switch (shape) {
    case "circle":
      return "rounded-full";
    case "square":
      return "rounded-[1.25rem]";
    case "triangle":
      return "clip-triangle";
    case "star":
      return "clip-star";
  }
}

export function ShapeToken({
  shape,
  color,
  size = "lg"
}: {
  shape: ShapeKind;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizing =
    size === "sm" ? "h-10 w-10" : size === "md" ? "h-14 w-14" : "h-20 w-20";
  const triangleSize =
    size === "sm"
      ? "border-x-[20px] border-b-[34px]"
      : size === "md"
        ? "border-x-[28px] border-b-[48px]"
        : "border-x-[34px] border-b-[58px]";
  const starSize =
    size === "sm"
      ? "border-x-[14px] border-b-[11px] after:left-[-14px] after:top-[5px] after:border-x-[14px] after:border-b-[11px]"
      : size === "md"
        ? "border-x-[18px] border-b-[14px] after:left-[-18px] after:top-[7px] after:border-x-[18px] after:border-b-[14px]"
        : "border-x-[24px] border-b-[18px] after:left-[-24px] after:top-[8px] after:border-x-[24px] after:border-b-[18px]";

  if (shape === "triangle") {
    return (
      <span
        className={`block h-0 w-0 border-x-transparent ${triangleSize}`}
        style={{ borderBottomColor: color } satisfies CSSProperties}
      />
    );
  }

  if (shape === "star") {
    return (
      <span
        className={`relative block h-0 w-0 border-x-transparent border-b-current text-transparent after:absolute after:block after:h-0 after:w-0 after:rotate-180 after:border-x-transparent after:border-b-current after:content-[''] ${starSize}`}
        style={{ color } satisfies CSSProperties}
      />
    );
  }

  return (
    <span
      className={`${sizing} ${shapeClass(shape)} block shadow-inner`}
      style={{ backgroundColor: color } satisfies CSSProperties}
    />
  );
}
