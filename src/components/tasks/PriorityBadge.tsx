import React from "react";
import { TaskPriority } from "@/types/database";
import { cn } from "@/lib/utils";
import { Flame, ArrowUp, Minus, ArrowDown } from "lucide-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: "sm" | "md";
  className?: string;
}

export function PriorityBadge({
  priority,
  size = "md",
  className,
}: PriorityBadgeProps) {
  const config: Record<
    TaskPriority,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    urgent: {
      label: "Urgent",
      icon: <Flame className="w-3 h-3 text-[#D84B66]" />,
      bg: "bg-[#D84B66]/10",
      text: "text-[#D84B66]",
      border: "border-[#D84B66]/25",
    },
    high: {
      label: "High",
      icon: <ArrowUp className="w-3 h-3 text-[#6F00FF]" />,
      bg: "bg-[#6F00FF]/10",
      text: "text-[#6F00FF]",
      border: "border-[#6F00FF]/25",
    },
    medium: {
      label: "Medium",
      icon: <Minus className="w-3 h-3 text-[#D99516]" />,
      bg: "bg-[#D99516]/10",
      text: "text-[#D99516]",
      border: "border-[#D99516]/25",
    },
    low: {
      label: "Low",
      icon: <ArrowDown className="w-3 h-3 text-[#837C8D]" />,
      bg: "bg-[#FAF7FC]",
      text: "text-[#837C8D]",
      border: "border-[#F0E6F3]",
    },
  };

  const item = config[priority] || config.medium;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border select-none",
        item.bg,
        item.text,
        item.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        className
      )}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
}

