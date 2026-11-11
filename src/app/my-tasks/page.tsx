"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, LayoutGrid, ListFilter, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/database";

const STATUS_FILTERS: { key: string; label: string; icon?: React.ElementType }[] = [
  { key: "all", label: "All Tasks" },
  { key: "in_progress", label: "In Production" },
  { key: "in_review", label: "In Review" },
  { key: "revision", label: "Revision Required" },
  { key: "completed", label: "Completed" },
];

export default function MyTasksPage() {
  const {
    tasks,
    isSidebarCollapsed,
    setIsCreateTaskOpen,
    searchQuery,
    categoryFilter,
    setCategoryFilter,
  } = useTaskContext();

  const [activeStatus, setActiveStatus] = useState("all");
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.client.brand_name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (activeStatus !== "all" && t.status !== activeStatus) return false;

    // Category filter
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

    return true;
  });

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="My Creative Deliverables"
        subtitle="Manage personal sprint queues, assigned assets, and client revisions."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20">
            {filteredTasks.length} Active Items
          </span>
        }
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>New Deliverable</span>
          </Button>
        }
      />

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-2 rounded-2xl bg-white border border-[#F0E6F3] shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveStatus(f.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                activeStatus === f.key
                  ? "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-xs font-semibold"
                  : "text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Layout Switch */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewLayout("grid")}
            className={cn(
              "p-2 rounded-xl transition-colors",
              viewLayout === "grid"
                ? "bg-[#6F00FF]/10 text-[#6F00FF]"
                : "text-[#837C8D] hover:bg-[#FAF7FC]"
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewLayout("list")}
            className={cn(
              "p-2 rounded-xl transition-colors",
              viewLayout === "list"
                ? "bg-[#6F00FF]/10 text-[#6F00FF]"
                : "text-[#837C8D] hover:bg-[#FAF7FC]"
            )}
            title="List View"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="There are no deliverables matching your selected status and discipline filters."
          actionLabel="Create Deliverable"
          onAction={() => setIsCreateTaskOpen(true)}
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewLayout === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} compact={viewLayout === "list"} />
          ))}
        </div>
      )}
    </main>
  );
}

