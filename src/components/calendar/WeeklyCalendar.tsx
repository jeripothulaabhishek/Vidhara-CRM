"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { CalendarTaskCard } from "./CalendarTaskCard";
import { WeeklyDateSelector } from "./WeeklyDateSelector";
import { cn } from "@/lib/utils";
import { Task } from "@/types/database";

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const WEEK_DAYS = [
  { key: 1, label: "MONDAY", short: "MON" },
  { key: 2, label: "TUESDAY", short: "TUE" },
  { key: 3, label: "WEDNESDAY", short: "WED" },
  { key: 4, label: "THURSDAY", short: "THU" },
  { key: 5, label: "FRIDAY", short: "FRI" },
  { key: 6, label: "SATURDAY", short: "SAT" },
  { key: 0, label: "SUNDAY", short: "SUN" },
];

export function WeeklyCalendar() {
  const { tasks, selectedDate, setSelectedDate, setIsCreateTaskOpen } = useTaskContext();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  });

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleToday = () => {
    const today = new Date(2026, 10, 11);
    setSelectedDate(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Generate the 7 days of this week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-4">
      {/* Top Date & View Controls */}
      <WeeklyDateSelector
        currentWeekStart={currentWeekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 7-Column Weekly Grid (Inspired directly by Reference Image 2) */}
      <div className="bg-white rounded-3xl border border-[#F0E6F3] shadow-sm overflow-x-auto p-4 md:p-6">
        <div className="min-w-[900px]">
          {/* Header row: Days of the week */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-3 pb-4 border-b border-[#F0E6F3]">
            {/* Week number badge */}
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-[#837C8D]">
              <span className="text-[10px] font-mono uppercase">WEEK</span>
              <span className="text-sm font-bold text-[#241A33]">46</span>
            </div>

            {/* 7 Day Headers */}
            {weekDates.map((date, idx) => {
              const isToday =
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth();

              const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
              const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer text-center",
                    isToday
                      ? "bg-[#190E26] text-white shadow-md shadow-[#190E26]/20 font-bold"
                      : "bg-[#FAF7FC] text-[#241A33] hover:bg-[#FFF1F1] hover:text-[#6F00FF] border border-[#F0E6F3]"
                  )}
                >
                  <span className={cn("text-[11px] font-semibold tracking-wider", isToday ? "text-[#E9B3FB]" : "text-[#837C8D]")}>
                    {dayName}
                  </span>
                  <span className="text-sm font-bold mt-0.5">{dateStr}</span>
                </button>
              );
            })}
          </div>

          {/* Time Rows and Columns Grid */}
          <div className="relative mt-4 divide-y divide-[#F0E6F3]/50">
            {/* Horizontal current time line matching Reference Image 2 */}
            <div
              className="absolute left-[80px] right-0 top-[115px] z-20 pointer-events-none flex items-center"
            >
              <div className="bg-[#6F00FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm -ml-2">
                09:45
              </div>
              <div className="flex-1 border-t-2 border-dashed border-[#6F00FF]/60 ml-1" />
            </div>

            {TIME_SLOTS.map((time) => {
              const hourInt = parseInt(time.split(":")[0], 10);

              return (
                <div
                  key={time}
                  className="grid grid-cols-[80px_repeat(7,1fr)] gap-3 min-h-[90px] py-2 items-start"
                >
                  {/* Time label */}
                  <div className="text-xs font-mono text-[#837C8D] pt-1">
                    {time}
                  </div>

                  {/* 7 columns for each day */}
                  {weekDates.map((date, dayIdx) => {
                    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                    // Match tasks scheduled around this hour
                    const matchingTasks = tasks.filter((t) => {
                      if (!t.scheduled_time) return false;
                      const taskHour = parseInt(t.scheduled_time.split(":")[0], 10);
                      const isSameDay = t.due_date === dateKey;
                      return isSameDay && taskHour === hourInt;
                    });

                    const variants: Array<"lavender" | "purple" | "peach" | "white"> = [
                      "lavender",
                      "purple",
                      "peach",
                      "white",
                    ];
                    const chosenVariant = variants[(dayIdx + hourInt) % variants.length];

                    return (
                      <div
                        key={dayIdx}
                        className="h-full min-h-[70px] rounded-xl hover:bg-[#FAF7FC]/50 p-1 transition-colors relative group/cell"
                      >
                        {matchingTasks.map((task) => (
                          <CalendarTaskCard
                            key={task.id}
                            task={task}
                            variant={chosenVariant}
                          />
                        ))}

                        {matchingTasks.length === 0 && (
                          <button
                            onClick={() => setIsCreateTaskOpen(true)}
                            className="w-full h-full min-h-[60px] rounded-xl border border-dashed border-transparent hover:border-[#E9B3FB] opacity-0 group-hover/cell:opacity-100 flex items-center justify-center text-[10px] text-[#6F00FF] font-semibold transition-all"
                          >
                            + Slot
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

