"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Task, TaskStatus } from "@/types/database";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { useTaskContext } from "@/context/TaskContext";
import { CATEGORY_COLORS, cn } from "@/lib/utils";
import {
  Pin,
  MessageSquare,
  Paperclip,
  Calendar,
  MoreVertical,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  className?: string;
}

export function TaskCard({ task, compact = false, className }: TaskCardProps) {
  const { togglePinTask, updateTaskStatus, deleteTask, openTaskDetail } = useTaskContext();
  const [showMenu, setShowMenu] = useState(false);

  const categoryStyle = CATEGORY_COLORS[task.category] || {
    bg: "bg-[#FAF7FC]",
    text: "text-[#241A33]",
    border: "border-[#F0E6F3]",
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTaskStatus(task.id, status);
    setShowMenu(false);
  };

  return (
    <div
      onClick={() => openTaskDetail(task.id)}
      className={cn(
        "group relative p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB] transition-all duration-300 flex flex-col justify-between cursor-pointer",
        task.is_pinned && "border-[#E9B3FB]/80 ring-1 ring-[#E9B3FB]/40",
        className
      )}
    >
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                categoryStyle.bg,
                categoryStyle.text,
                categoryStyle.border
              )}
            >
              {task.category}
            </span>
            <PriorityBadge priority={task.priority} size="sm" />
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => togglePinTask(task.id)}
              className={cn(
                "p-1.5 rounded-xl transition-colors",
                task.is_pinned
                  ? "text-[#6F00FF] bg-[#6F00FF]/10"
                  : "text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC]"
              )}
              title={task.is_pinned ? "Unpin task" : "Pin to weekly priorities"}
            >
              <Pin className={cn("w-3.5 h-3.5", task.is_pinned && "fill-current")} />
            </button>

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-xl text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-44 rounded-2xl glass-popover border border-[#F0E6F3] shadow-xl p-1.5 z-30 text-xs animate-fade-in"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <p className="px-2.5 py-1 text-[10px] font-semibold text-[#837C8D] uppercase tracking-wider">
                    Change Status
                  </p>
                  {(["in_progress", "in_review", "revision", "completed"] as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-xl capitalize flex items-center justify-between hover:bg-[#FAF7FC] transition-colors",
                        task.status === st ? "text-[#6F00FF] font-semibold" : "text-[#241A33]"
                      )}
                    >
                      {st.replace("_", " ")}
                      {task.status === st && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                  <div className="my-1 border-t border-[#F0E6F3]" />
                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-[#D84B66] hover:bg-[#D84B66]/10 transition-colors"
                  >
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Title & Description */}
        <h4 className="text-sm font-semibold text-[#241A33] leading-snug group-hover:text-[#6F00FF] transition-colors line-clamp-2">
          {task.title}
        </h4>

        {!compact && task.description && (
          <p className="text-xs text-[#837C8D] mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Preview image if available */}
        {!compact && task.deliverable_preview && (
          <div className="relative w-full h-28 rounded-2xl overflow-hidden mt-3 border border-[#F0E6F3] group-hover:border-[#E9B3FB] transition-colors">
            <Image
              src={task.deliverable_preview}
              alt={task.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
              <span className="text-[11px] text-white font-medium flex items-center gap-1">
                Preview deliverable <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Meta info */}
      <div className="mt-3.5 pt-3 border-t border-[#F0E6F3] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-[#F0E6F3] shrink-0" title={task.assigned_to.full_name}>
            <Image
              src={task.assigned_to.avatar_url}
              alt={task.assigned_to.full_name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-medium text-[#241A33] truncate">
            {task.client.brand_name}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#837C8D] shrink-0">
          {task.scheduled_time && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#6F00FF]">
              <Clock className="w-3 h-3" />
              {task.scheduled_time}
            </span>
          )}
          {task.comments_count > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3 h-3" />
              {task.comments_count}
            </span>
          )}
          <TaskStatusBadge status={task.status} size="sm" showIcon={false} />
        </div>
      </div>
    </div>
  );
}

