import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "lavender" | "purple";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#6F00FF]/10 text-[#6F00FF] border-[#6F00FF]/20",
    secondary: "bg-[#FAF7FC] text-[#241A33] border-[#F0E6F3]",
    outline: "border-[#F0E6F3] text-[#837C8D] bg-white",
    success: "bg-[#16865C]/10 text-[#16865C] border-[#16865C]/20",
    warning: "bg-[#D99516]/10 text-[#D99516] border-[#D99516]/20",
    destructive: "bg-[#D84B66]/10 text-[#D84B66] border-[#D84B66]/20",
    lavender: "bg-[#E9B3FB]/25 text-[#3B0270] border-[#E9B3FB]/60 font-semibold",
    purple: "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-sm border-transparent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

