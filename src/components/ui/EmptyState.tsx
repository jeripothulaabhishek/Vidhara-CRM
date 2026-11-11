import React from "react";
import { cn } from "@/lib/utils";
import { FolderKanban } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FFF1F1] border border-[#E9B3FB]/50 flex items-center justify-center text-[#6F00FF] mb-4">
        {icon || <FolderKanban className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#241A33]">{title}</h3>
      <p className="text-xs md:text-sm text-[#837C8D] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

