"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import {
  Sparkles,
  Plus,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  ArrowRight,
  MessageSquare,
  FileCheck2,
  ChevronRight,
  Pin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberTask {
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
  is_pinned: boolean;
  pin_note: string | null;
  created_at: string;
  updated_at: string;
}

interface FeedbackItem {
  id: string;
  content: string;
  taskTitle: string;
  taskId: string;
  timeAgo: string;
  authorName: string;
}

export default function MemberDashboardPage() {
  const { isSidebarCollapsed, currentUser } = useTaskContext();
  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Client";

  useEffect(() => {
    async function loadMemberData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Fetch member's own tasks
          const { data: memberTasks } = await supabase
            .from("tasks")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });

          if (memberTasks) {
            setTasks(memberTasks as MemberTask[]);
          }

          // 2. Fetch recent admin comments on this member's tasks
          const { data: comments } = await supabase
            .from("task_comments")
            .select(`
              id,
              content,
              created_at,
              task:tasks(id, title),
              author:profiles(full_name, role)
            `)
            .order("created_at", { ascending: false })
            .limit(4);

          if (comments) {
            const formatted = comments
              .filter((c: any) => c.task && c.author?.role === "ADMIN")
              .map((c: any) => ({
                id: c.id,
                content: c.content,
                taskTitle: c.task.title,
                taskId: c.task.id,
                timeAgo: "Recent",
                authorName: c.author.full_name,
              }));
            setRecentFeedback(formatted);
          }
        }
      } catch (err) {
        console.error("Member dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMemberData();
  }, []);

  // Compute live metrics
  const totalSubmitted = tasks.length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED" || t.status === "NEW"
  ).length;
  const inReviewCount = tasks.filter((t) => t.status === "IN_REVIEW").length;
  const inRevisionCount = tasks.filter((t) => t.status === "REVISION").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = tasks
    .filter((t) => t.deadline && t.status !== "COMPLETED" && new Date(t.deadline) <= next7Days)
    .slice(0, 3);

  const pinnedTasks = tasks.filter((t) => t.is_pinned);
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "REJECTED");

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {/* Welcome Banner */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-white via-white to-[#FAF1FD] border border-[#F0E6F3] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Vidhara Creative Hub
              </span>
              <span className="text-xs text-[#837C8D]">Asia/Kolkata (IST)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#241A33] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-xs md:text-sm text-[#837C8D] mt-0.5 max-w-xl">
              Track your creative deliverables, review design drafts, and submit new project briefs directly to the agency studio.
            </p>
          </div>

          <Link href="/portal/tasks/new" className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="shadow-md shadow-[#6F00FF]/25 bg-gradient-to-r from-[#6F00FF] to-[#3B0270]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Submit New Design Request</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-AREA DASHBOARD COMPOSITION (REFERENCE IMAGE 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SECTION (Col 1 to 4) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Weekly Pinned Deliverables */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-[#6F00FF]" />
                <h3 className="text-sm font-bold text-[#241A33]">Weekly Pinned</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#837C8D]">
                {pinnedTasks.length} Pinned
              </span>
            </div>

            {pinnedTasks.length > 0 ? (
              <div className="space-y-3">
                {pinnedTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/portal/tasks/${t.id}`}
                    className="block p-3.5 rounded-2xl bg-[#FAF7FC] hover:bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-[#6F00FF] uppercase">
                        {t.design_category}
                      </span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <h4 className="text-xs font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors line-clamp-2">
                      {t.title}
                    </h4>
                    {t.pin_note && (
                      <p className="text-[11px] text-[#837C8D] mt-1 line-clamp-1 italic">
                        {t.pin_note}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF7FC] border border-dashed border-[#F0E6F3] text-center">
                <p className="text-xs text-[#837C8D]">
                  No deliverables pinned this week.
                </p>
              </div>
            )}

            <Link href="/portal/tasks/new" className="mt-4 block">
              <button className="w-full py-2.5 rounded-2xl border border-dashed border-[#E9B3FB] text-xs font-semibold text-[#6F00FF] hover:bg-[#FAF1FD] transition-all flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Design Request</span>
              </button>
            </Link>
          </div>

          {/* Mini Calendar Widget */}
          <MiniCalendar />

          {/* Urgent Deadlines Widget */}
          {upcomingDeadlines.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#D84B66]" />
                <h3 className="text-sm font-bold text-[#241A33]">Upcoming Deadlines</h3>
              </div>
              <div className="space-y-2.5">
                {upcomingDeadlines.map((t) => (
                  <Link
                    key={t.id}
                    href={`/portal/tasks/${t.id}`}
                    className="p-3 rounded-2xl bg-[#D84B66]/5 border border-[#D84B66]/15 hover:border-[#D84B66]/40 transition-all block"
                  >
                    <p className="text-xs font-bold text-[#241A33] truncate">{t.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-[#D84B66] font-semibold">
                        Due {t.deadline ? new Date(t.deadline).toLocaleDateString() : "Soon"}
                      </span>
                      <span className="text-[10px] text-[#837C8D] uppercase font-bold">
                        {t.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER SECTION (Col 5 to 8): Daily & Active Deliverables */}
        <div className="lg:col-span-8 xl:col-span-6 bg-white rounded-3xl p-5 md:p-6 border border-[#F0E6F3] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0E6F3]">
            <div>
              <h2 className="text-base font-bold text-[#241A33]">Active Deliverables</h2>
              <p className="text-xs text-[#837C8D]">Live progress of your submitted design briefs</p>
            </div>
            <Link
              href="/portal/tasks"
              className="text-xs font-semibold text-[#6F00FF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeTasks.length > 0 ? (
            <div className="space-y-3.5">
              {activeTasks.map((t) => {
                // Determine mock progress percentage based on status
                let progress = 10;
                if (t.status === "ACCEPTED") progress = 30;
                if (t.status === "IN_PROGRESS") progress = 60;
                if (t.status === "IN_REVIEW") progress = 85;
                if (t.status === "REVISION") progress = 70;
                if (t.status === "COMPLETED") progress = 100;

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#FAF7FC] hover:bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#837C8D]">
                          #{t.task_number || "REQ"}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-[#3B0270] border border-[#F0E6F3]">
                          {t.design_category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={t.priority} />
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                            t.status === "NEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
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

                    <Link href={`/portal/tasks/${t.id}`}>
                      <h3 className="text-sm font-bold text-[#241A33] hover:text-[#6F00FF] transition-colors">
                        {t.title}
                      </h3>
                    </Link>

                    {t.description && (
                      <p className="text-xs text-[#837C8D] mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-3.5 pt-3 border-t border-[#F0E6F3]">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-[#837C8D]">Production Stage</span>
                        <span className="font-bold text-[#241A33]">{progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EAE2F0] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6F00FF] to-[#3B0270] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mt-3 text-xs text-[#837C8D]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#6F00FF]" />
                        {t.deadline
                          ? `Due ${new Date(t.deadline).toLocaleDateString()}`
                          : "Flexible Deadline"}
                      </span>

                      <Link
                        href={`/portal/tasks/${t.id}`}
                        className="font-semibold text-[#6F00FF] hover:underline flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF1FD] flex items-center justify-center text-[#6F00FF] mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#241A33]">No Active Deliverables</h4>
              <p className="text-xs text-[#837C8D] max-w-sm mx-auto">
                Submit your first creative brief for logos, social kits, UI/UX designs, or marketing assets.
              </p>
              <Link href="/portal/tasks/new" className="inline-block mt-2">
                <Button variant="primary" size="md">
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Submit Design Request</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT SECTION (Col 9 to 12): Metrics & Feedback */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#F0E6F3] shadow-xs">
              <span className="text-[10px] text-[#837C8D] uppercase font-bold tracking-wider">
                Submitted
              </span>
              <p className="text-2xl font-extrabold text-[#241A33] mt-1">{totalSubmitted}</p>
              <span className="text-[10px] text-[#6F00FF] font-medium">All time</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#F0E6F3] shadow-xs">
              <span className="text-[10px] text-[#837C8D] uppercase font-bold tracking-wider">
                In Production
              </span>
              <p className="text-2xl font-extrabold text-[#6F00FF] mt-1">{inProgressCount}</p>
              <span className="text-[10px] text-[#837C8D]">Active sprint</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#F0E6F3] shadow-xs">
              <span className="text-[10px] text-[#837C8D] uppercase font-bold tracking-wider">
                In Review
              </span>
              <p className="text-2xl font-extrabold text-[#D99516] mt-1">{inReviewCount}</p>
              <span className="text-[10px] text-[#837C8D]">Awaiting signoff</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#F0E6F3] shadow-xs">
              <span className="text-[10px] text-[#837C8D] uppercase font-bold tracking-wider">
                Completed
              </span>
              <p className="text-2xl font-extrabold text-[#16865C] mt-1">{completedCount}</p>
              <span className="text-[10px] text-[#16865C] font-medium">Delivered</span>
            </div>
          </div>

          {/* Recent Studio Feedback */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#6F00FF]" />
              <h3 className="text-sm font-bold text-[#241A33]">Studio Feedback</h3>
            </div>

            {recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {recentFeedback.map((fb) => (
                  <Link
                    key={fb.id}
                    href={`/portal/tasks/${fb.taskId}`}
                    className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all block group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#837C8D] mb-1">
                      <span className="font-bold text-[#6F00FF]">{fb.authorName}</span>
                      <span>{fb.timeAgo}</span>
                    </div>
                    <p className="text-xs text-[#241A33]/90 line-clamp-2 leading-relaxed">
                      &ldquo;{fb.content}&rdquo;
                    </p>
                    <span className="text-[10px] text-[#837C8D] mt-1.5 block truncate group-hover:text-[#6F00FF]">
                      On: {fb.taskTitle}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF7FC] border border-dashed border-[#F0E6F3] text-center">
                <p className="text-xs text-[#837C8D]">
                  No design comments received yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
