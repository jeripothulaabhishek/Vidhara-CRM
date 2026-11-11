"use client";

import React from "react";
import { TrendingUp, Award, CheckCircle } from "lucide-react";

export function MonthlyStatsWidget() {
  const metrics = [
    { label: "Completed Deliverables", value: "48", target: "Target: 50", progress: 96, color: "bg-[#6F00FF]" },
    { label: "On-Time Delivery Rate", value: "94.2%", target: "Benchmark: 90%", progress: 94, color: "bg-[#16865C]" },
    { label: "First-Pass Client Approval", value: "88%", target: "Benchmark: 80%", progress: 88, color: "bg-[#3B0270]" },
  ];

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#D99516]" />
          <h4 className="text-xs font-bold text-[#241A33]">Monthly Performance</h4>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#16865C]/10 text-[#16865C]">
          +12% vs last month
        </span>
      </div>

      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#837C8D] font-medium">{m.label}</span>
              <span className="font-bold text-[#241A33]">{m.value}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#FAF7FC] overflow-hidden border border-[#F0E6F3]">
              <div
                className={`h-full rounded-full ${m.color}`}
                style={{ width: `${m.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#837C8D]">
              <span>{m.target}</span>
              <span className="text-[#6F00FF] font-medium">{m.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

