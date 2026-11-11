"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TEAM_MEMBERS, CLIENT_COMPANIES } from "@/lib/mock-data";
import { Plus, Shield, Users, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/database";

const COLUMNS: { id: TaskStatus; title: string; countColor: string }[] = [
  { id: "backlog", title: "Backlog & Briefs", countColor: "bg-[#FAF7FC] text-[#837C8D]" },
  { id: "in_progress", title: "In Production", countColor: "bg-[#6F00FF]/10 text-[#6F00FF]" },
  { id: "in_review", title: "Internal / Client Review", countColor: "bg-[#E9B3FB]/30 text-[#3B0270]" },
  { id: "revision", title: "Revisions Needed", countColor: "bg-[#D99516]/10 text-[#D99516]" },
  { id: "completed", title: "Approved & Delivered", countColor: "bg-[#16865C]/10 text-[#16865C]" },
];

export default function AllTasksPage() {
  const { tasks, isSidebarCollapsed, setIsCreateTaskOpen } = useTaskContext();
  const [selectedDesigner, setSelectedDesigner] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  const filteredTasks = tasks.filter((t) => {
    if (selectedDesigner !== "all" && t.assigned_to.id !== selectedDesigner) return false;
    if (selectedClient !== "all" && t.client.id !== selectedClient) return false;
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
        title="Agency Master Task Pipeline"
        subtitle="Admin workspace: Monitor studio capacity, cross-designer workflows, and bottleneck prevention."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF] text-white flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Admin Only
          </span>
        }
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Create Deliverable</span>
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white border border-[#F0E6F3] shadow-sm mb-6 text-xs">
        <div className="flex items-center gap-1.5 text-[#837C8D]">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#241A33]">Filters:</span>
        </div>

        {/* Designer filter */}
        <select
          value={selectedDesigner}
          onChange={(e) => setSelectedDesigner(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-[#241A33] font-medium outline-none cursor-pointer hover:border-[#6F00FF]"
        >
          <option value="all">All Designers ({TEAM_MEMBERS.length})</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name} ({m.agency_role})
            </option>
          ))}
        </select>

        {/* Client filter */}
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-[#241A33] font-medium outline-none cursor-pointer hover:border-[#6F00FF]"
        >
          <option value="all">All Clients ({CLIENT_COMPANIES.length})</option>
          {CLIENT_COMPANIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.brand_name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[#837C8D] font-mono text-[11px]">
          Showing {filteredTasks.length} tasks
        </span>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#FAF7FC]/80 rounded-3xl p-3 border border-[#F0E6F3] flex flex-col gap-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-2 pb-0">
                <h4 className="text-xs font-bold text-[#241A33] truncate">{col.title}</h4>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#F0E6F3]",
                    col.countColor
                  )}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks list */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-[#F0E6F3] flex items-center justify-center text-[11px] text-[#837C8D]">
                    Empty stage
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

