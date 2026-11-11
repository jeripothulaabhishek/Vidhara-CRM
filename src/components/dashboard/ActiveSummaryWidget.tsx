"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  AlertCircle,
  FileCheck2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

export function ActiveSummaryWidget() {
  const { tasks } = useTaskContext();

  const totalActive = tasks.filter((t) => t.status !== "completed").length;
  const inReview = tasks.filter((t) => t.status === "in_review").length;
  const inRevision = tasks.filter((t) => t.status === "revision").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  return (
    <div className="space-y-3">
      {/* Active Deliverable Summary Card */}
      <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#241A33]">Active Summary</h4>
              <p className="text-[10px] text-[#837C8D]">Creative Sprint Overview</p>
            </div>
          </div>
          <span className="text-xl font-bold text-[#6F00FF]">{totalActive}</span>
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0E6F3]">
          <Link
            href="/reviews"
            className="p-2.5 rounded-2xl bg-[#FFF1F1]/70 hover:bg-[#FFF1F1] border border-[#E9B3FB]/50 transition-colors group"
          >
            <span className="text-[10px] font-medium text-[#837C8D] block">Pending Reviews</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-[#3B0270]">{inReview}</span>
              <FileCheck2 className="w-3.5 h-3.5 text-[#6F00FF] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/my-tasks"
            className="p-2.5 rounded-2xl bg-[#FAF7FC] hover:bg-white border border-[#F0E6F3] transition-colors group"
          >
            <span className="text-[10px] font-medium text-[#837C8D] block">In Revision</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-[#D99516]">{inRevision}</span>
              <AlertCircle className="w-3.5 h-3.5 text-[#D99516] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {urgentCount > 0 && (
          <div className="p-2.5 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 flex items-center justify-between text-xs text-[#D84B66]">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {urgentCount} Urgent Deadlines Today
            </span>
            <Link href="/my-tasks" className="font-bold underline text-[11px]">
              View
            </Link>
          </div>
        )}
      </div>

      {/* Agency Superpower Card inspired by Reference Image 1 bottom right card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#3B0270] via-[#4D068F] to-[#6F00FF] text-white shadow-lg shadow-[#6F00FF]/20 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#E9B3FB]/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#E9B3FB] mb-2.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold leading-snug">
            Vidhara Creative Engine
          </h4>
          <p className="text-xs text-[#E9B3FB]/90 mt-1 leading-relaxed">
            Automate asset handoffs, 3D exports, and client proofing links in seconds.
          </p>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[11px] text-white/70 font-mono">v2.4 Enterprise</span>
            <Link
              href="/requests"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-[#3B0270] hover:bg-[#FFF1F1] transition-all hover:scale-105"
            >
              Intake Portal <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

