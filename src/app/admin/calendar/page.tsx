"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { Button } from "@/components/ui/Button";
import { Plus, Download } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

export default function AdminCalendarPage() {
  const { setIsCreateTaskOpen, showToast } = useTaskContext();

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      <PageHeader
        title="Admin Studio Calendar"
        subtitle="Orchestrate seven-day studio sprints, production shifts, and client deliverable milestones."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => showToast("Exporting", "Studio iCal schedule feed generated.", "info")}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Slot</span>
            </Button>
          </div>
        }
      />

      <WeeklyCalendar />
    </main>
  );
}
