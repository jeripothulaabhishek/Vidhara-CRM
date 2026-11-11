"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { CalendarTaskCard } from "./CalendarTaskCard";
import { WeeklyDateSelector } from "./WeeklyDateSelector";
import { cn, CATEGORY_COLORS } from "@/lib/utils";
import { Task } from "@/types/database";
import { Clock, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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

export function WeeklyCalendar() {
  const { tasks, selectedDate, setSelectedDate, setIsCreateTaskOpen, openTaskDetail } = useTaskContext();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  });

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() - 1);
      setSelectedDate(new Date(d));
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() + 1);
      setSelectedDate(new Date(d));
    } else {
      d.setDate(d.getDate() + 7);
    }
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

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

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

      {/* WEEK VIEW (Reference Image 2 Inspired) */}
      {viewMode === "week" && (
        <div className="bg-white rounded-3xl border border-[#F0E6F3] shadow-sm overflow-x-auto p-4 md:p-6 animate-fade-in">
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
              <div className="absolute left-[80px] right-0 top-[115px] z-20 pointer-events-none flex items-center">
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
      )}

      {/* DAY VIEW (Deep Single-Day Hourly Schedule) */}
      {viewMode === "day" && (
        <div className="bg-white rounded-3xl border border-[#F0E6F3] shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
            <div>
              <h3 className="text-base font-bold text-[#241A33]">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <p className="text-xs text-[#837C8D]">Hour-by-hour studio production slots</p>
            </div>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white text-xs font-semibold shadow-xs"
            >
              + Add Slot
            </button>
          </div>

          <div className="space-y-3 divide-y divide-[#F0E6F3]/60">
            {TIME_SLOTS.map((time) => {
              const hourInt = parseInt(time.split(":")[0], 10);
              const matchingTasks = tasks.filter((t) => {
                if (!t.scheduled_time) return false;
                const taskHour = parseInt(t.scheduled_time.split(":")[0], 10);
                return (t.due_date === selectedDateKey || !t.due_date) && taskHour === hourInt;
              });

              return (
                <div key={time} className="pt-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-semibold text-[#837C8D] w-16 pt-1">
                    {time}
                  </span>

                  <div className="flex-1">
                    {matchingTasks.length === 0 ? (
                      <div
                        onClick={() => setIsCreateTaskOpen(true)}
                        className="p-3 rounded-2xl border border-dashed border-[#F0E6F3] hover:border-[#E9B3FB] text-xs text-[#837C8D] cursor-pointer hover:bg-[#FAF7FC] transition-colors"
                      >
                        No deliverable scheduled. Click to assign studio time.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchingTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => openTaskDetail(t.id)}
                            className="p-4 rounded-2xl bg-[#FAF1FD] border border-[#E9B3FB] hover:border-[#6F00FF] cursor-pointer shadow-xs transition-all flex items-start justify-between gap-3 group"
                          >
                            <div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#3B0270] border border-[#E9B3FB]">
                                {t.category}
                              </span>
                              <h4 className="text-sm font-bold text-[#241A33] mt-1 group-hover:text-[#6F00FF] transition-colors">
                                {t.title}
                              </h4>
                              <p className="text-xs text-[#837C8D] mt-0.5">
                                Client: <strong>{t.client.brand_name}</strong> • Assigned: {t.assigned_to.full_name}
                              </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#6F00FF] bg-white px-2.5 py-1 rounded-xl shadow-2xs">
                              {t.scheduled_time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTH VIEW (Full 35-Day Grid with Deliverable Pills) */}
      {viewMode === "month" && (
        <div className="bg-white rounded-3xl border border-[#F0E6F3] shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
            <h3 className="text-base font-bold text-[#241A33]">
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <span className="text-xs text-[#837C8D]">Total Active Deliverables: {tasks.length}</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs font-bold text-[#837C8D] py-1">
                {day}
              </div>
            ))}

            {Array.from({ length: 35 }, (_, idx) => {
              const dayNum = (idx % 30) + 1;
              const dateStr = `2026-11-${String(dayNum).padStart(2, "0")}`;
              const dayTasks = tasks.filter((t) => t.due_date === dateStr);
              const isToday = dayNum === 11;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(new Date(2026, 10, dayNum))}
                  className={cn(
                    "min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between",
                    isToday
                      ? "bg-[#FAF1FD] border-[#6F00FF] ring-1 ring-[#6F00FF]/40 shadow-xs"
                      : "bg-[#FAF7FC]/50 border-[#F0E6F3] hover:border-[#E9B3FB] hover:bg-white"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                        isToday ? "bg-[#6F00FF] text-white" : "text-[#241A33]"
                      )}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-[#6F00FF]">
                        {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDetail(t.id);
                        }}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-white border border-[#E9B3FB] text-[#3B0270] truncate hover:text-[#6F00FF]"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-[#837C8D] font-mono">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
