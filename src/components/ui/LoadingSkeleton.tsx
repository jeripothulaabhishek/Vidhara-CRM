import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "card" | "line";
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  const variantClasses = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    line: "rounded-lg h-4",
    card: "rounded-3xl h-36",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[#F0E6F3]/70",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

