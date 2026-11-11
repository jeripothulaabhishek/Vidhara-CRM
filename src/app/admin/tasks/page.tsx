"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { useTaskContext } from "@/context/TaskContext";
import {
  LayoutGrid,
  ListFilter,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Check,
  Eye,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/database";

const STATUS_OPTIONS = [
  { key: "ALL", label: "All Statuses" },
  { key: "NEW", label: "New Requests" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Production" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "REVISION", label: "Revisions" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
];

function AdminTasksContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const {
    tasks,
    setIsCreateTaskOpen,
    openTaskDetail,
    updateTaskStatus,
    deleteTask,
    showToast,
  } = useTaskContext();

  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.client.brand_name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status
    if (selectedStatus !== "ALL") {
      const normalizedStatus = t.status.toUpperCase();
      if (selectedStatus === "NEW" || selectedStatus === "ACCEPTED") {
        if (normalizedStatus !== "BACKLOG" && normalizedStatus !== "NEW" && normalizedStatus !== "ACCEPTED") {
          return false;
        }
      } else if (normalizedStatus !== selectedStatus) {
        return false;
      }
    }

    // Priority
    if (selectedPriority !== "ALL" && t.priority !== selectedPriority) return false;

    return true;
  });

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      <PageHeader
        title="Admin Deliverables Manager"
        subtitle="Full administrative control over agency tasks, milestone signoffs, designer assignments, and revision rounds."
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Create Deliverable</span>
          </Button>
        }
      />

      {/* Control Bar: Filters, Search, and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#F0E6F3] shadow-sm mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#837C8D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, clients, categories..."
            className="w-full bg-transparent text-xs md:text-sm text-[#241A33] placeholder:text-[#837C8D] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8 px-2.5 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center p-0.5 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3]">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "table" ? "bg-white text-[#6F00FF] shadow-2xs" : "text-[#837C8D]"
              )}
              title="Table View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "kanban" ? "bg-white text-[#6F00FF] shadow-2xs" : "text-[#837C8D]"
              )}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-[#F0E6F3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F0E6F3] bg-[#FAF7FC] text-[#837C8D] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Task Title</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Designer</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6F3]/70">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[#837C8D]">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => openTaskDetail(task.id)}
                      className="hover:bg-[#FAF1FD]/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors line-clamp-1">
                          {task.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#241A33]">
                        {task.client.brand_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF7FC] text-[#3B0270] border border-[#F0E6F3]">
                          {task.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={task.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <TaskStatusBadge status={task.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-[#837C8D]">
                        {task.assigned_to.full_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#837C8D]">
                        {task.due_date}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openTaskDetail(task.id)}
                            className="p-1.5 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC]"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateTaskStatus(task.id, "completed");
                              showToast("Completed", `Task "${task.title}" approved.`, "success");
                            }}
                            className="p-1.5 rounded-lg text-[#16865C] hover:bg-[#16865C]/10"
                            title="Mark completed"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {(["in_progress", "in_review", "revision", "completed"] as TaskStatus[]).map((stage) => {
            const stageTasks = filteredTasks.filter((t) => t.status === stage);

            return (
              <div
                key={stage}
                className="bg-white/80 rounded-3xl p-4 border border-[#F0E6F3] shadow-xs space-y-3 min-h-[450px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E6F3]">
                  <h4 className="text-xs font-bold text-[#241A33] capitalize">
                    {stage.replace("_", " ")}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7FC] text-[#6F00FF]">
                    {stageTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskDetail(t.id)}
                      className="p-3.5 rounded-2xl bg-[#FAF7FC] hover:bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className="text-[10px] font-semibold text-[#837C8D] block mb-1">
                        {t.client.brand_name}
                      </span>
                      <h5 className="text-xs font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors leading-snug">
                        {t.title}
                      </h5>
                      <div className="mt-3 pt-2 border-t border-[#F0E6F3] flex items-center justify-between">
                        <PriorityBadge priority={t.priority} size="sm" />
                        <span className="text-[10px] font-mono text-[#837C8D]">{t.due_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function AdminTasksPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-[#837C8D]">Loading tasks...</div>}>
      <AdminTasksContent />
    </React.Suspense>
  );
}
