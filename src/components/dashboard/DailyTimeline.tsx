"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { PriorityBadge } from "../tasks/PriorityBadge";
import { TaskStatusBadge } from "../tasks/TaskStatusBadge";
import { CATEGORY_COLORS, cn } from "@/lib/utils";
import { Task } from "@/types/database";

export function DailyTimeline() {
  const {
    selectedDate,
    setSelectedDate,
    tasks,
    setIsCreateTaskOpen,
    updateTaskStatus,
    openTaskDetail,
  } = useTaskContext();

  const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const dayOfMonth = selectedDate.getDate();
  const monthName = selectedDate.toLocaleDateString("en-US", { month: "short" });

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  // Format date string for comparison YYYY-MM-DD
  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // Filter tasks for this day or fallback to today's active schedule
  const dayTasks = tasks
    .filter((t) => t.due_date === dateKey || !t.due_date)
    .sort((a, b) => (a.scheduled_time || "00:00").localeCompare(b.scheduled_time || "00:00"));

  // Fallback to top tasks if empty on selected day so dashboard always looks rich
  const displayTasks = dayTasks.length > 0 ? dayTasks : tasks.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header matching Reference Image 1 */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#241A33]">
            Today&apos;s schedule
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-semibold text-[#6F00FF]">
              {dayOfWeek} {dayOfMonth}
            </span>
            <span className="text-xs text-[#837C8D]">({monthName})</span>
            <div className="flex items-center ml-1">
              <button
                onClick={handlePrevDay}
                className="p-1 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-white transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextDay}
                className="p-1 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-white transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Plus action button matching reference image 1 */}
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#6F00FF] to-[#3B0270] hover:opacity-95 text-white flex items-center justify-center shadow-md shadow-[#6F00FF]/25 hover:scale-105 transition-all"
          title="Schedule task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-3 before:w-0.5 before:bg-gradient-to-b before:from-[#E9B3FB] before:via-[#6F00FF]/40 before:to-[#E9B3FB]/20 before:-z-0">
        {displayTasks.map((task, index) => {
          const isFirstTwo = index < 2;
          const isCompleted = task.status === "completed";
          const catStyle = CATEGORY_COLORS[task.category] || {
            bg: "bg-[#FAF7FC]",
            text: "text-[#241A33]",
            border: "border-[#F0E6F3]",
            iconBg: "bg-[#6F00FF]/10 text-[#6F00FF]",
          };

          return (
            <div
              key={task.id}
              className={cn(
                "relative z-10 pl-8 transition-all group",
                isCompleted && "opacity-70"
              )}
            >
              {/* Timeline Notch dot */}
              <div
                className={cn(
                  "absolute left-1 top-4 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all group-hover:scale-110",
                  isFirstTwo
                    ? "border-[#6F00FF] bg-[#6F00FF] text-white"
                    : isCompleted
                    ? "border-[#16865C] bg-[#16865C] text-white"
                    : "border-[#E9B3FB] group-hover:border-[#6F00FF]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isFirstTwo ? "bg-white" : "bg-[#6F00FF]"
                    )}
                  />
                )}
              </div>

              {/* Schedule Card */}
              <div
                onClick={() => openTaskDetail(task.id)}
                className={cn(
                  "p-4 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer",
                  isFirstTwo
                    ? "bg-gradient-to-r from-[#FAF1FD] to-[#F5E8FB] border-[#E9B3FB] hover:border-[#6F00FF]"
                    : "bg-white border-[#F0E6F3] hover:border-[#E9B3FB]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
                        catStyle.iconBg
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "text-sm font-bold text-[#241A33] truncate group-hover:text-[#6F00FF] transition-colors",
                            isCompleted && "line-through text-[#837C8D]"
                          )}
                        >
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#837C8D]">
                        <span className="font-medium text-[#241A33]">
                          {task.client.brand_name}
                        </span>
                        <span>•</span>
                        <span>{task.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3B0270] bg-white/80 px-2.5 py-1 rounded-full border border-[#E9B3FB]/60 shadow-xs">
                      <Clock className="w-3 h-3 text-[#6F00FF]" />
                      {task.scheduled_time || "10:00 AM"}
                    </span>
                  </div>
                </div>

                {/* Sub details: attendees / comments / preview thumbnail */}
                {task.description && (
                  <p className="text-xs text-[#837C8D] mt-2.5 pl-12 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="mt-3 pt-2.5 pl-12 border-t border-[#F0E6F3]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {/* Assigned Avatar */}
                    <div className="flex items-center -space-x-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-white">
                        <Image
                          src={task.assigned_to.avatar_url}
                          alt={task.assigned_to.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-white bg-[#E9B3FB] text-[#3B0270] text-[10px] font-bold flex items-center justify-center">
                        +2
                      </div>
                    </div>
                    <span className="text-[11px] text-[#837C8D]">
                      {task.assigned_to.full_name.split(" ")[0]} & team
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <PriorityBadge priority={task.priority} size="sm" />
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          isCompleted ? "in_progress" : "completed"
                        )
                      }
                      className={cn(
                        "p-1.5 rounded-xl border text-[11px] font-semibold transition-colors flex items-center gap-1",
                        isCompleted
                          ? "bg-[#16865C]/10 text-[#16865C] border-[#16865C]/30"
                          : "bg-white text-[#837C8D] hover:text-[#16865C] hover:border-[#16865C] border-[#F0E6F3]"
                      )}
                      title={isCompleted ? "Mark incomplete" : "Complete deliverable"}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isCompleted ? "Done" : "Mark done"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

