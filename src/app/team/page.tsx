"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TEAM_MEMBERS } from "@/lib/mock-data";
import { Users, UserPlus, Mail, Shield, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const { isSidebarCollapsed, showToast } = useTaskContext();

  const handleInvite = () => {
    showToast("Invite Sent", "Invitation link generated for new team designer.", "success");
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Agency Creative Team"
        subtitle="Manage designer roster, discipline assignments, and active sprint capacities."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {TEAM_MEMBERS.length} Studio Members
          </span>
        }
        action={
          <Button variant="primary" size="md" onClick={handleInvite}>
            <UserPlus className="w-4 h-4" />
            <span>Invite Designer</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#6F00FF]/20 shadow-xs">
                  <Image
                    src={member.avatar_url}
                    alt={member.full_name}
                    fill
                    className="object-cover"
                  />
                </div>

                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    member.role === "admin"
                      ? "bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/30"
                      : "bg-[#FAF7FC] text-[#3B0270] border border-[#F0E6F3]"
                  )}
                >
                  {member.role.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-base font-bold text-[#241A33]">{member.full_name}</h4>
              <p className="text-xs font-medium text-[#6F00FF]">{member.agency_role}</p>
              <p className="text-[11px] text-[#837C8D] mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>

              {/* Workload Progress */}
              <div className="mt-4 p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#837C8D] font-medium">Sprint Capacity</span>
                  <span className="font-bold text-[#241A33]">{member.tasks_count || 6} / 12 Tasks</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#F0E6F3]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6F00FF] to-[#9D4EFF]"
                    style={{ width: `${Math.min(100, ((member.tasks_count || 6) / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0E6F3] flex items-center justify-between">
              <span className="text-[11px] text-[#16865C] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16865C] inline-block animate-pulse" />
                Active in Studio
              </span>

              <button
                onClick={() => showToast("Profile Inspector", `Viewing portfolio for ${member.full_name}.`, "info")}
                className="text-xs text-[#6F00FF] font-semibold hover:underline"
              >
                View Assignments
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

