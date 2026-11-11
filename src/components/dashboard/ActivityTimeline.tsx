"use client";

import React from "react";
import Image from "next/image";
import { History, ArrowRight } from "lucide-react";
import { RECENT_ACTIVITIES } from "@/lib/mock-data";
import Link from "next/link";

export function ActivityTimeline() {
  return (
    <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#6F00FF]" />
          <h4 className="text-xs font-bold text-[#241A33]">Recent Creative Activity</h4>
        </div>
        <Link
          href="/reviews"
          className="text-[11px] text-[#6F00FF] hover:underline font-medium"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {RECENT_ACTIVITIES.map((act) => (
          <div key={act.id} className="flex items-start gap-2.5 text-xs">
            <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#F0E6F3] shrink-0 mt-0.5">
              <Image
                src={act.user.avatar}
                alt={act.user.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[#241A33] leading-snug">
                <span className="font-semibold text-[#241A33]">{act.user.name}</span>{" "}
                <span className="text-[#837C8D]">{act.action}</span>{" "}
                <span className="font-semibold text-[#6F00FF]">{act.target}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#837C8D] font-mono">{act.timeAgo}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FAF7FC] text-[#837C8D] border border-[#F0E6F3]">
                  {act.category.split(" ")[0]}
                </span>
              </div>
            </div>

            {act.previewImage && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#F0E6F3]">
                <Image
                  src={act.previewImage}
                  alt={act.target}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

