"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Plus } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

interface WeeklyDateSelectorProps {
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  viewMode: "day" | "week" | "month";
  onViewModeChange: (mode: "day" | "week" | "month") => void;
}

export function WeeklyDateSelector({
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  viewMode,
  onViewModeChange,
}: WeeklyDateSelectorProps) {
  const { setIsCreateTaskOpen, showToast } = useTaskContext();

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatRange = () => {
    const startStr = currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startStr} – ${endStr}`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm mb-6">
      {/* Week Selector Dropdown & Nav arrows */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33]">
          <CalendarIcon className="w-4 h-4 text-[#6F00FF]" />
          <span>{formatRange()}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-xl border border-[#F0E6F3] text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC] transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 rounded-xl border border-[#F0E6F3] text-xs font-semibold text-[#241A33] hover:text-[#6F00FF] hover:bg-[#FAF7FC] transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 rounded-xl border border-[#F0E6F3] text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC] transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right controls: View toggles & Add deliverable button */}
      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex items-center p-1 bg-[#FAF7FC] rounded-2xl border border-[#F0E6F3] text-xs font-medium">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "px-3 py-1.5 rounded-xl capitalize transition-all",
                viewMode === mode
                  ? "bg-white text-[#6F00FF] font-semibold shadow-xs"
                  : "text-[#837C8D] hover:text-[#241A33]"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            showToast("Schedule Synchronized", "All studio calendar events are up to date.", "info");
          }}
          className="p-2.5 rounded-2xl border border-[#F0E6F3] text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC] transition-colors"
          title="Refresh calendar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateTaskOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Deliverable</span>
        </Button>
      </div>
    </div>
  );
}

