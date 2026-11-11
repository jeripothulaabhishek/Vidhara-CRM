"use client";

import React from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { CheckCircle2, Download, ExternalLink, Archive, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompletedPage() {
  const { tasks, isSidebarCollapsed, showToast } = useTaskContext();

  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Completed Creative Archive"
        subtitle="Repository of client-approved designs, master brand files, and production-ready deliverables."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16865C]/10 text-[#16865C] border border-[#16865C]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedTasks.length} Delivered
          </span>
        }
        action={
          <Button
            variant="secondary"
            size="md"
            onClick={() => showToast("Exporting Archive", "Compiling client delivery zip...", "info")}
          >
            <Download className="w-4 h-4" />
            <span>Batch Download</span>
          </Button>
        }
      />

      {/* Grid of completed showcases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#16865C]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {task.deliverable_preview ? (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 border border-[#F0E6F3]">
                  <Image
                    src={task.deliverable_preview}
                    alt={task.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#16865C] text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Delivered
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] flex items-center justify-center text-[#837C8D] mb-3">
                  <Archive className="w-8 h-8" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF7FC] text-[#3B0270] border border-[#F0E6F3]">
                  {task.category}
                </span>
                <span className="text-xs font-semibold text-[#837C8D]">
                  {task.client.brand_name}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors leading-snug">
                {task.title}
              </h4>
              <p className="text-xs text-[#837C8D] mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0E6F3] flex items-center justify-between">
              <span className="text-[11px] text-[#837C8D] font-mono">
                Approved {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : "Nov 2026"}
              </span>

              <button
                onClick={() => showToast("Opening Deliverable", `Fetching asset package for ${task.title}.`, "info")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6F00FF] hover:underline"
              >
                <span>View Handoff</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

