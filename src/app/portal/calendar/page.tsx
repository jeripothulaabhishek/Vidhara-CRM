"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarTask {
  id: string;
  task_number: number;
  title: string;
  design_category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "NEW" | "ACCEPTED" | "IN_PROGRESS" | "IN_REVIEW" | "REVISION" | "COMPLETED" | "REJECTED";
  deadline: string | null;
  scheduled_time: string | null;
}

export default function MemberCalendarPage() {
  const { isSidebarCollapsed, currentUser } = useTaskContext();
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  });

  const firstName = currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Client";

  useEffect(() => {
    async function loadTasks() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("tasks")
            .select("id, task_number, title, design_category, priority, status, deadline, scheduled_time")
            .eq("created_by", user.id);

          if (data) setTasks(data as CalendarTask[]);
        }
      } catch (err) {
        console.error("Calendar task load error:", err);
      }
    }
    loadTasks();
  }, []);

  // Compute 7 days of the active week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Overdue and Due Today Tasks
  const overdueTasks = tasks.filter((t) => {
    if (!t.deadline || t.status === "COMPLETED" || t.status === "REJECTED") return false;
    return new Date(t.deadline) < now && t.deadline.split("T")[0] !== todayStr;
  });

  const dueTodayTasks = tasks.filter((t) => {
    if (!t.deadline || t.status === "COMPLETED") return false;
    return t.deadline.split("T")[0] === todayStr;
  });

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const resetToToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title={`Studio Schedule, ${firstName}`}
        subtitle="Seven-day milestone schedule, requested deadlines, and deliverable review sessions in Asia/Kolkata (IST)."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9B3FB]/30 text-[#3B0270] border border-[#E9B3FB]">
            Asia/Kolkata (IST)
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={resetToToday}>
              Today
            </Button>
            <div className="flex items-center rounded-xl bg-white border border-[#F0E6F3] p-0.5">
              <button
                onClick={prevWeek}
                className="p-1.5 rounded-lg hover:bg-[#FAF7FC] text-[#837C8D] hover:text-[#241A33]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextWeek}
                className="p-1.5 rounded-lg hover:bg-[#FAF7FC] text-[#837C8D] hover:text-[#241A33]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link href="/portal/tasks/new">
              <Button variant="primary" size="md" className="bg-[#6F00FF]">
                <Plus className="w-4 h-4 mr-1" />
                <span>New Request</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Deadline Indicator Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Due Today */}
        <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#241A33]">Due Today</h4>
              <p className="text-[11px] text-[#837C8D]">
                {dueTodayTasks.length} deliverable(s) scheduled for delivery today
              </p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-[#6F00FF]">{dueTodayTasks.length}</span>
        </div>

        {/* Overdue Alert */}
        <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D84B66]/10 text-[#D84B66] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#241A33]">Overdue Deliverables</h4>
              <p className="text-[11px] text-[#837C8D]">
                {overdueTasks.length} deliverable(s) past requested deadline
              </p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-[#D84B66]">{overdueTasks.length}</span>
        </div>
      </div>

      {/* 7-COLUMN WEEKLY CALENDAR (REFERENCE IMAGE 2 INSPIRATION) */}
      <div className="rounded-3xl bg-white border border-[#F0E6F3] shadow-sm overflow-hidden p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split("T")[0];
            const isToday = dateStr === todayStr;
            const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = day.getDate();

            // Find tasks matching this day
            const dayTasks = tasks.filter(
              (t) => t.deadline && t.deadline.split("T")[0] === dateStr
            );

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl p-3 min-h-[360px] flex flex-col justify-between border transition-all",
                  isToday
                    ? "bg-[#FAF1FD] border-[#6F00FF]/40 ring-1 ring-[#6F00FF]/30"
                    : "bg-[#FAF7FC] border-[#F0E6F3]"
                )}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0E6F3]">
                    <span className="text-xs font-bold uppercase text-[#837C8D]">
                      {dayName}
                    </span>
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isToday
                          ? "bg-[#6F00FF] text-white shadow-xs"
                          : "text-[#241A33]"
                      )}
                    >
                      {dayNum}
                    </span>
                  </div>

                  {/* Tasks on this Day */}
                  <div className="space-y-2">
                    {dayTasks.map((t) => (
                      <Link
                        key={t.id}
                        href={`/portal/tasks/${t.id}`}
                        className="p-2.5 rounded-xl bg-white border border-[#F0E6F3] hover:border-[#6F00FF] hover:shadow-xs transition-all block group"
                      >
                        <span className="text-[9px] font-bold text-[#6F00FF] uppercase block">
                          {t.design_category.split(" ")[0]}
                        </span>
                        <h4 className="text-[11px] font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors line-clamp-2 mt-0.5">
                          {t.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F0E6F3] text-[9px] text-[#837C8D]">
                          <span>#{t.task_number || "REQ"}</span>
                          <span className="uppercase font-bold text-[#241A33]">
                            {t.status.replace("_", " ")}
                          </span>
                        </div>
                      </Link>
                    ))}

                    {dayTasks.length === 0 && (
                      <div className="py-8 text-center text-[11px] text-[#837C8D]/60 italic">
                        No deadlines
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href="/portal/tasks/new"
                  className="mt-3 py-1.5 text-center text-[10px] font-semibold text-[#837C8D] hover:text-[#6F00FF] border border-dashed border-[#F0E6F3] hover:border-[#6F00FF] rounded-xl block transition-all"
                >
                  + Add Request
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
