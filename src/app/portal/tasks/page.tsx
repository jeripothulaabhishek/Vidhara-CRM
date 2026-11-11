"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  CalendarDays,
  Filter,
  ArrowUpDown,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { key: "ALL", label: "All Tasks" },
  { key: "NEW", label: "New Requests" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "REVISION", label: "Revisions" },
  { key: "COMPLETED", label: "Completed" },
];

interface PortalTaskItem {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  design_category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "NEW" | "ACCEPTED" | "IN_PROGRESS" | "IN_REVIEW" | "REVISION" | "COMPLETED" | "REJECTED";
  deadline: string | null;
  scheduled_time: string | null;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export default function MemberTasksPage() {
  const { isSidebarCollapsed } = useTaskContext();
  const [tasks, setTasks] = useState<PortalTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [sortBy, setSortBy] = useState<"created" | "deadline" | "priority">("created");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  useEffect(() => {
    async function loadTasks() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            setTasks(data as PortalTaskItem[]);
          }
        }
      } catch (err) {
        console.error("Failed to load member tasks:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Status Tab
        if (activeTab !== "ALL" && t.status !== activeTab) {
          return false;
        }

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            t.title.toLowerCase().includes(q) ||
            t.design_category.toLowerCase().includes(q) ||
            String(t.task_number).includes(q);
          if (!match) return false;
        }

        // Category Filter
        if (selectedCategory !== "ALL" && t.design_category !== selectedCategory) {
          return false;
        }

        // Priority Filter
        if (selectedPriority !== "ALL" && t.priority !== selectedPriority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === "priority") {
          const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return pOrder[b.priority] - pOrder[a.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tasks, activeTab, searchQuery, selectedCategory, selectedPriority, sortBy]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.design_category));
    return Array.from(set);
  }, [tasks]);

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="My Creative Deliverables"
        subtitle="Track submitted briefs, design production progress, feedback rounds, and finalized design assets."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20">
            {tasks.length} Total Deliverables
          </span>
        }
        action={
          <Link href="/portal/tasks/new">
            <Button
              variant="primary"
              size="md"
              className="bg-gradient-to-r from-[#6F00FF] to-[#3B0270] shadow-sm shadow-[#6F00FF]/30"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Submit Request</span>
            </Button>
          </Link>
        }
      />

      {/* Status Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === "ALL"
              ? tasks.length
              : tasks.filter((t) => t.status === tab.key).length;

          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                isActive
                  ? "bg-[#6F00FF] text-white shadow-sm shadow-[#6F00FF]/30"
                  : "bg-white text-[#837C8D] hover:text-[#241A33] border border-[#F0E6F3]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-[#FAF7FC] text-[#837C8D]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search, Category, Priority, Sort, View Switcher */}
      <div className="p-3.5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#837C8D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables by name, category, or #ID..."
            className="w-full bg-transparent text-xs text-[#241A33] placeholder:text-[#837C8D] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer"
          >
            <option value="created">Sort: Newest First</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
          </select>

          {/* View Toggle */}
          <div className="flex rounded-xl bg-[#FAF7FC] p-1 border border-[#F0E6F3]">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "cards" ? "bg-white text-[#6F00FF] shadow-xs" : "text-[#837C8D]"
              )}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "list" ? "bg-white text-[#6F00FF] shadow-xs" : "text-[#837C8D]"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Content Display */}
      {filteredTasks.length > 0 ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-[#837C8D]">
                      #{t.task_number || "REQ"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={t.priority} />
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          t.status === "NEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                          t.status === "ACCEPTED" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                          t.status === "IN_PROGRESS" && "bg-[#E9B3FB]/25 text-[#6F00FF] border border-[#E9B3FB]",
                          t.status === "IN_REVIEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                          t.status === "REVISION" && "bg-[#D99516]/10 text-[#D99516] border border-[#D99516]/30",
                          t.status === "COMPLETED" && "bg-[#16865C]/10 text-[#16865C] border border-[#16865C]/30"
                        )}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-[#6F00FF] uppercase tracking-wider block mb-1">
                    {t.design_category}
                  </span>

                  <Link href={`/portal/tasks/${t.id}`}>
                    <h3 className="text-sm font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors line-clamp-2">
                      {t.title}
                    </h3>
                  </Link>

                  {t.description && (
                    <p className="text-xs text-[#837C8D] mt-1.5 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#F0E6F3] flex items-center justify-between text-xs text-[#837C8D]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6F00FF]" />
                    {t.deadline ? new Date(t.deadline).toLocaleDateString() : "Flexible"}
                  </span>

                  <Link
                    href={`/portal/tasks/${t.id}`}
                    className="font-semibold text-[#6F00FF] hover:underline flex items-center gap-1"
                  >
                    <span>View Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List / Table View */
          <div className="rounded-3xl bg-white border border-[#F0E6F3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7FC] border-b border-[#F0E6F3] text-[#837C8D] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Task ID</th>
                    <th className="py-3.5 px-4">Deliverable Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6F3]">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FAF7FC]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#837C8D]">
                        #{t.task_number || "REQ"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/portal/tasks/${t.id}`}
                          className="font-bold text-[#241A33] hover:text-[#6F00FF] transition-colors"
                        >
                          {t.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[#6F00FF] font-semibold">
                        {t.design_category}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            t.status === "NEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                            t.status === "ACCEPTED" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                            t.status === "IN_PROGRESS" && "bg-[#E9B3FB]/25 text-[#6F00FF] border border-[#E9B3FB]",
                            t.status === "IN_REVIEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                            t.status === "REVISION" && "bg-[#D99516]/10 text-[#D99516] border border-[#D99516]/30",
                            t.status === "COMPLETED" && "bg-[#16865C]/10 text-[#16865C] border border-[#16865C]/30"
                          )}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#837C8D]">
                        {t.deadline ? new Date(t.deadline).toLocaleDateString() : "Flexible"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/portal/tasks/${t.id}`}
                          className="font-semibold text-[#6F00FF] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white border border-[#F0E6F3] p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF1FD] flex items-center justify-center text-[#6F00FF] mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#241A33]">No Deliverables Found</h3>
          <p className="text-xs text-[#837C8D] max-w-sm mx-auto">
            {searchQuery || activeTab !== "ALL"
              ? "No tasks match your active filters. Try resetting the status or query."
              : "You haven't submitted any creative briefs yet. Submit your first request to get started."}
          </p>
          <Link href="/portal/tasks/new" className="inline-block mt-2">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1" />
              <span>Submit Design Request</span>
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
