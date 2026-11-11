"use client";

import React from "react";
import { useTaskContext } from "@/context/TaskContext";
import { WeeklyPinnedTasks } from "@/components/dashboard/WeeklyPinnedTasks";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { DailyTimeline } from "@/components/dashboard/DailyTimeline";
import { ActiveSummaryWidget } from "@/components/dashboard/ActiveSummaryWidget";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { MonthlyStatsWidget } from "@/components/dashboard/MonthlyStatsWidget";
import { StatCard } from "@/components/ui/StatCard";
import { Sparkles, Layers, CheckCircle2, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { isSidebarCollapsed, tasks, searchQuery } = useTaskContext();

  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inReviewCount = tasks.filter((t) => t.status === "in_review" || t.status === "revision").length;

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {/* Top Welcome & KPI Metric Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Agency Workspace
              </span>
              <span className="text-xs text-[#837C8D]">Vidhara Design Suite</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#241A33] mt-1.5">
              Creative Control Center
            </h1>
            <p className="text-xs md:text-sm text-[#837C8D] mt-0.5">
              Live tracking of brand identities, 3D assets, UI flows, and client deliverables.
            </p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Total Deliverables"
            value={totalTasks}
            change="+8.4%"
            subtitle="Active client retainers"
            icon={<Layers className="w-5 h-5 text-[#6F00FF]" />}
            iconBg="bg-[#6F00FF]/10"
          />
          <StatCard
            title="In Production"
            value={inProgressCount}
            change="+4"
            subtitle="Designs being crafted"
            icon={<Zap className="w-5 h-5 text-[#3B0270]" />}
            iconBg="bg-[#FAF1FD]"
          />
          <StatCard
            title="Pending Signoff"
            value={inReviewCount}
            change="2 Urgent"
            isPositive={false}
            subtitle="Client review stage"
            icon={<Clock className="w-5 h-5 text-[#D99516]" />}
            iconBg="bg-[#D99516]/10"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            change="+18%"
            subtitle="Approved this cycle"
            icon={<CheckCircle2 className="w-5 h-5 text-[#16865C]" />}
            iconBg="bg-[#16865C]/10"
          />
        </div>
      </div>

      {/* 3-AREA DASHBOARD COMPOSITION INSPIRED BY REFERENCE IMAGE 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT AREA (Col 1 to 4):
            - Weekly Pinned Tasks
            - Important upcoming deadlines
            - Small monthly calendar
            - Add new weekly pin
        */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          <WeeklyPinnedTasks />
          <MiniCalendar />
        </div>

        {/* CENTER AREA (Col 5 to 8):
            - Today's schedule
            - Selected date
            - Daily task timeline
            - Task cards arranged by time
            - Attendees, client, priority, status
        */}
        <div className="lg:col-span-8 xl:col-span-6 bg-white/70 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-[#F0E6F3] shadow-sm">
          <DailyTimeline />
        </div>

        {/* RIGHT AREA (Col 9 to 12):
            - Active task summary
            - Agency superpowers
            - Recent activity widget
            - Monthly task completion statistics
        */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          <ActiveSummaryWidget />
          <ActivityTimeline />
          <MonthlyStatsWidget />
        </div>
      </div>
    </main>
  );
}

