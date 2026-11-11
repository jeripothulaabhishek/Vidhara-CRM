"use client";

import React from "react";
import Image from "next/image";
import { Task } from "@/types/database";
import { Sparkles, Clock, ExternalLink, Eye, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";

interface CalendarTaskCardProps {
  task: Task;
  variant?: "lavender" | "purple" | "peach" | "white";
  onSelect?: () => void;
}

export function CalendarTaskCard({ task, variant = "lavender", onSelect }: CalendarTaskCardProps) {
  const { showToast, openTaskDetail } = useTaskContext();

  const variantStyles = {
    lavender: "bg-[#F7E5FC] border-[#E9B3FB] text-[#3B0270] hover:bg-[#F2D6FA]",
    purple: "bg-[#6F00FF]/10 border-[#6F00FF]/30 text-[#241A33] hover:bg-[#6F00FF]/15",
    peach: "bg-[#FFF1F1] border-[#E9B3FB]/60 text-[#241A33] hover:bg-[#FFE8E8]",
    white: "bg-white border-[#F0E6F3] text-[#241A33] hover:border-[#E9B3FB] shadow-xs",
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskDetail(task.id);
  };

  return (
    <div
      onClick={onSelect || (() => openTaskDetail(task.id))}
      className={cn(
        "p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
        variantStyles[variant]
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center text-[#6F00FF] shrink-0 shadow-xs">
            <Sparkles className="w-3 h-3" />
          </div>

          <span className="text-[10px] font-mono text-[#837C8D] flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-[#6F00FF]" />
            {task.scheduled_time || "09:30"}
          </span>
        </div>

        <h5 className="text-xs font-bold leading-snug line-clamp-2 text-[#241A33] group-hover:text-[#6F00FF] transition-colors">
          {task.title}
        </h5>

        <p className="text-[10px] text-[#837C8D] mt-0.5 truncate">
          {task.client.brand_name}
        </p>

        {task.deliverable_preview && (
          <div className="relative w-full h-14 rounded-xl overflow-hidden mt-2 border border-black/5">
            <Image
              src={task.deliverable_preview}
              alt={task.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
        {/* Attendees */}
        <div className="flex items-center -space-x-1.5">
          <div className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-white">
            <Image
              src={task.assigned_to.avatar_url}
              alt={task.assigned_to.full_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="w-5 h-5 rounded-full bg-[#3B0270] text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white">
            +2
          </div>
        </div>

        {/* Action pill button */}
        <button
          onClick={handleActionClick}
          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/90 text-[#3B0270] hover:bg-white hover:text-[#6F00FF] border border-[#E9B3FB]/50 transition-colors shadow-2xs flex items-center gap-1"
        >
          <span>Review</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

