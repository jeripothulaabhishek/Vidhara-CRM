"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pin, Calendar, MoreHorizontal, Trash2 } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { PriorityBadge } from "../tasks/PriorityBadge";
import { CATEGORY_COLORS, cn } from "@/lib/utils";

export function WeeklyPinnedTasks() {
  const { pinnedTasks, removeWeeklyPin, setIsCreateTaskOpen } = useTaskContext();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-[#6F00FF] fill-[#6F00FF]/20" />
          <h3 className="text-sm font-bold text-[#241A33] tracking-tight">Weekly Pinned</h3>
        </div>
        <Link
          href="/my-tasks"
          className="text-xs text-[#6F00FF] hover:text-[#3B0270] font-medium transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Pinned Tasks List */}
      <div className="space-y-3">
        {pinnedTasks.length === 0 ? (
          <div className="p-4 rounded-3xl bg-white/60 border border-dashed border-[#E9B3FB] text-center text-xs text-[#837C8D]">
            No pinned priorities this week. Pin tasks to keep them prominent.
          </div>
        ) : (
          pinnedTasks.map((pin) => {
            const catStyle = CATEGORY_COLORS[pin.category] || {
              bg: "bg-[#FAF7FC]",
              text: "text-[#241A33]",
              border: "border-[#F0E6F3]",
            };

            return (
              <div
                key={pin.id}
                className="relative p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB] transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar / Category Icon */}
                  <div className="relative w-10 h-10 rounded-2xl overflow-hidden ring-1 ring-[#F0E6F3] shrink-0 mt-0.5">
                    <Image
                      src={pin.avatar}
                      alt={pin.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#241A33] truncate group-hover:text-[#6F00FF] transition-colors">
                        {pin.title}
                      </h4>

                      <button
                        onClick={() => setActiveMenu(activeMenu === pin.id ? null : pin.id)}
                        className="text-[#837C8D] hover:text-[#241A33] p-1 rounded-lg"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#837C8D] mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#6F00FF]" />
                      {pin.date_label}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          catStyle.bg,
                          catStyle.text,
                          catStyle.border
                        )}
                      >
                        {pin.category.split(" ")[0]}
                      </span>
                      <PriorityBadge priority={pin.priority} size="sm" />
                    </div>

                    {pin.note && (
                      <p className="text-[11px] text-[#241A33]/80 mt-2 bg-[#FAF7FC] p-2 rounded-xl border border-[#F0E6F3] line-clamp-2 leading-relaxed">
                        {pin.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                {activeMenu === pin.id && (
                  <div
                    className="absolute right-3 top-10 w-36 rounded-2xl glass-popover border border-[#F0E6F3] shadow-lg p-1 z-20 text-xs animate-fade-in"
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <button
                      onClick={() => {
                        removeWeeklyPin(pin.id);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#D84B66] hover:bg-[#D84B66]/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Unpin task
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add new weekly pin CTA card matching Reference Image 1 */}
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="w-full py-3.5 px-4 rounded-3xl bg-white/70 hover:bg-white border-2 border-dashed border-[#E9B3FB]/80 hover:border-[#6F00FF] transition-all flex items-center justify-center gap-2 text-xs font-semibold text-[#6F00FF] hover:shadow-sm group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-xl bg-[#6F00FF]/10 group-hover:bg-[#6F00FF] group-hover:text-white text-[#6F00FF] flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add new weekly pin</span>
        </button>
      </div>
    </div>
  );
}

