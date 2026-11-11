"use client";

import React from "react";
import { useTaskContext } from "@/context/TaskContext";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Plus, Sparkles, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { isSidebarCollapsed, setIsCreateTaskOpen, currentUser, showToast } = useTaskContext();
  const firstName = currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Creative";

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title={`Stay up to date, ${firstName}`}
        subtitle="Manage seven-day studio schedules, production deadlines, and client review sessions."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9B3FB]/30 text-[#3B0270] border border-[#E9B3FB]">
            Weekly Studio Schedule
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => showToast("Exporting Calendar", "iCal / Google Calendar feed generated.", "info")}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Sync</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </Button>
          </div>
        }
      />

      {/* 7-Column Weekly Schedule (Reference Image 2) */}
      <WeeklyCalendar />
    </main>
  );
}

