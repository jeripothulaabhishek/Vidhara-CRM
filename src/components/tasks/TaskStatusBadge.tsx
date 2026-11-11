import React from "react";
import { TaskStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, RotateCcw, Eye, CircleDashed } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function TaskStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: TaskStatusBadgeProps) {
  const config: Record<
    TaskStatus,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    backlog: {
      label: "Backlog",
      icon: <CircleDashed className="w-3 h-3" />,
      bg: "bg-[#FAF7FC]",
      text: "text-[#837C8D]",
      border: "border-[#F0E6F3]",
    },
    in_progress: {
      label: "In Progress",
      icon: <Clock className="w-3 h-3 animate-spin text-[#6F00FF]" />,
      bg: "bg-[#FAF1FD]",
      text: "text-[#6F00FF]",
      border: "border-[#E9B3FB]/60",
    },
    in_review: {
      label: "In Review",
      icon: <Eye className="w-3 h-3 text-[#3B0270]" />,
      bg: "bg-[#E9B3FB]/25",
      text: "text-[#3B0270]",
      border: "border-[#E9B3FB]",
    },
    revision: {
      label: "Revision",
      icon: <RotateCcw className="w-3 h-3 text-[#D99516]" />,
      bg: "bg-[#D99516]/10",
      text: "text-[#D99516]",
      border: "border-[#D99516]/30",
    },
    completed: {
      label: "Completed",
      icon: <CheckCircle2 className="w-3 h-3 text-[#16865C]" />,
      bg: "bg-[#16865C]/10",
      text: "text-[#16865C]",
      border: "border-[#16865C]/30",
    },
  };

  const item = config[status] || config.in_progress;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border select-none transition-colors",
        item.bg,
        item.text,
        item.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {showIcon && item.icon}
      <span>{item.label}</span>
    </span>
  );
}

