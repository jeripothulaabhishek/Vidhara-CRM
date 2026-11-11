"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";

const DAYS_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MiniCalendar() {
  const { selectedDate, setSelectedDate, tasks } = useTaskContext();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 10, 1)); // Nov 2026
  const [viewMode, setViewMode] = useState<"month" | "two_weeks">("month");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Empty slots before month start
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Days with tasks
  const taskDayNumbers = new Set(
    tasks.map((t) => {
      const dt = new Date(t.due_date);
      if (dt.getMonth() === month && dt.getFullYear() === year) {
        return dt.getDate();
      }
      return null;
    }).filter(Boolean)
  );

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-bold text-[#241A33]">
            {monthNames[month]}, {year}
          </h4>
          <div className="flex items-center">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setViewMode(viewMode === "month" ? "two_weeks" : "month")}
          className="text-[11px] font-medium text-[#6F00FF] hover:underline"
        >
          {viewMode === "month" ? "Two weeks" : "Full month"}
        </button>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#837C8D] mb-1">
        {DAYS_HEADER.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarDays.slice(0, viewMode === "two_weeks" ? 14 : undefined).map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-7" />;
          }

          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          const hasTask = taskDayNumbers.has(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={cn(
                "relative h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center font-medium transition-all text-xs",
                isSelected
                  ? "bg-gradient-to-tr from-[#6F00FF] to-[#9D4EFF] text-white shadow-sm font-bold"
                  : "text-[#241A33] hover:bg-[#FFF1F1] hover:text-[#6F00FF]"
              )}
            >
              <span>{day}</span>
              {hasTask && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#6F00FF]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

