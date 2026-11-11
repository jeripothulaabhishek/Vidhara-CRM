"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useTaskContext } from "@/context/TaskContext";
import {
  Layers,
  Inbox,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Shield,
  Eye,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { tasks, openTaskDetail, updateTaskStatus, showToast } = useTaskContext();

  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const inReview = tasks.filter((t) => t.status === "in_review").length;
  const inRevision = tasks.filter((t) => t.status === "revision").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      <PageHeader
        title="Admin Command Center"
        subtitle="Live studio operations, task review queues, agency workloads, and client deliverable signoffs."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D84B66]/10 text-[#D84B66] border border-[#D84B66]/30 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Admin Master Role
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/tasks">
              <Button variant="secondary" size="md">
                <span>View All Tasks</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* 8 Live Statistics Cards (Matching Section 8) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        <StatCard
          title="Total Tasks"
          value={total}
          subtitle="All active agency jobs"
          icon={<Layers className="w-5 h-5 text-[#6F00FF]" />}
          iconBg="bg-[#6F00FF]/10"
        />
        <StatCard
          title="New Requests"
          value={3}
          subtitle="Pending admin review"
          icon={<Inbox className="w-5 h-5 text-[#3B0270]" />}
          iconBg="bg-[#FAF1FD]"
        />
        <StatCard
          title="In Production"
          value={inProgress}
          subtitle="Active designer sprints"
          icon={<Clock className="w-5 h-5 text-[#6F00FF]" />}
          iconBg="bg-[#E9B3FB]/25"
        />
        <StatCard
          title="In Review"
          value={inReview}
          subtitle="Awaiting client signoff"
          icon={<Eye className="w-5 h-5 text-[#3B0270]" />}
          iconBg="bg-[#FAF1FD]"
        />
        <StatCard
          title="In Revision"
          value={inRevision}
          subtitle="Changes requested"
          icon={<RotateCcw className="w-5 h-5 text-[#D99516]" />}
          iconBg="bg-[#D99516]/10"
        />
        <StatCard
          title="Completed"
          value={completed}
          subtitle="Approved deliverables"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16865C]" />}
          iconBg="bg-[#16865C]/10"
        />
        <StatCard
          title="Overdue Risk"
          value={urgentCount}
          subtitle="Urgent deadlines"
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5 text-[#D84B66]" />}
          iconBg="bg-[#D84B66]/10"
        />
        <StatCard
          title="Agency Capacity"
          value="84%"
          subtitle="Studio bandwidth"
          icon={<Users className="w-5 h-5 text-[#6F00FF]" />}
          iconBg="bg-[#FAF7FC]"
        />
      </div>

      {/* Two Column Layout: Latest Submissions & Quick Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Active Submissions Pipeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#F0E6F3] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
            <div>
              <h3 className="text-base font-bold text-[#241A33]">Active Design Tasks</h3>
              <p className="text-xs text-[#837C8D]">Manage client deliverables and trigger status transitions</p>
            </div>
            <Link
              href="/admin/tasks"
              className="text-xs text-[#6F00FF] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="p-4 rounded-2xl bg-[#FAF7FC] hover:bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#3B0270] border border-[#E9B3FB]">
                      {task.category}
                    </span>
                    <span className="text-xs font-semibold text-[#837C8D]">
                      {task.client.brand_name}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors truncate">
                    {task.title}
                  </h4>
                  <p className="text-xs text-[#837C8D] mt-0.5 line-clamp-1">
                    Assigned: {task.assigned_to.full_name} • Due: {task.due_date}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-mono font-bold capitalize px-2.5 py-1 rounded-xl bg-white border border-[#F0E6F3] text-[#241A33]">
                    {task.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => {
                      updateTaskStatus(task.id, "completed");
                      showToast("Task Approved", `Marked "${task.title}" as completed.`, "success");
                    }}
                    className="p-2 rounded-xl bg-[#16865C]/10 text-[#16865C] hover:bg-[#16865C] hover:text-white transition-colors"
                    title="Quick Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Supabase Live Status & Studio Actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Supabase Connection Widget */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#16865C]/10 text-[#16865C] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#241A33]">Supabase Live Status</h4>
                <p className="text-[10px] text-[#837C8D]">Vidhara-CRM Primary DB</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#837C8D]">Project URL:</span>
                <span className="font-mono text-[#241A33] font-semibold">qcsoqijogzckytccrmbl</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#837C8D]">Data API:</span>
                <span className="text-[#16865C] font-semibold">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#837C8D]">Admin Auth:</span>
                <span className="text-[#6F00FF] font-semibold">Ready</span>
              </div>
            </div>

            <Link href="/admin/settings" className="block text-center text-xs font-semibold text-[#6F00FF] hover:underline pt-1">
              Run Schema Verifier →
            </Link>
          </div>

          {/* Quick Admin Actions */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#3B0270] via-[#4D068F] to-[#6F00FF] text-white shadow-lg space-y-3">
            <h4 className="text-sm font-bold">Admin Actions</h4>
            <p className="text-xs text-[#E9B3FB]/90 leading-relaxed">
              Invite designers, approve client revisions, and orchestrate sprint deadlines.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/team"
                className="w-full py-2.5 px-3 rounded-xl bg-white text-[#3B0270] hover:bg-[#FFF1F1] text-xs font-bold text-center transition-all"
              >
                + Invite Team Member
              </Link>
              <Link
                href="/admin/calendar"
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium text-center transition-all"
              >
                Open Studio Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
