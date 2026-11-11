"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles, ArrowRight, Check, X, Clock, FileText, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientRequest {
  id: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  discipline: string;
  deadlineRequested: string;
  urgency: "urgent" | "standard";
  deliverableItems: string[];
  submittedAt: string;
}

const SAMPLE_REQUESTS: ClientRequest[] = [
  {
    id: "req-1",
    clientName: "Solstice Apparel",
    clientAvatar: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&auto=format&fit=crop&q=80",
    title: "Black Friday & Cyber Week 3D Campaign Assets",
    description: "Need 6 animated product carousels with dark obsidian theme, 3D typography treatments and countdown timer stickers.",
    discipline: "3D & Motion",
    deadlineRequested: "Nov 18, 2026",
    urgency: "urgent",
    deliverableItems: ["6x 3D Motion Reels (1080x1920)", "12x Story Statics", "Figma Design System Tokens"],
    submittedAt: "2 hours ago",
  },
  {
    id: "req-2",
    clientName: "Lumina Fintech",
    clientAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    title: "Virtual Debit Card Holographic Texture & Packaging",
    description: "Design physical packaging sleeve and 3D card hologram shader for VIP metal card launch.",
    discipline: "Packaging Design",
    deadlineRequested: "Nov 25, 2026",
    urgency: "standard",
    deliverableItems: ["Die-cut physical box mockup", "Hologram foil print proof", "C4D render turntable"],
    submittedAt: "5 hours ago",
  },
  {
    id: "req-3",
    clientName: "Aura Health",
    clientAvatar: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=100&auto=format&fit=crop&q=80",
    title: "Smart Ring Sleep Stage Companion App UI",
    description: "Full redesign of the REM and Deep sleep timeline charts with glassmorphic cards and purple-to-lavender sleep score gradient.",
    discipline: "UI/UX Design",
    deadlineRequested: "Nov 20, 2026",
    urgency: "standard",
    deliverableItems: ["14 Figma Screens", "Micro-interaction prototype", "Component Token Specs"],
    submittedAt: "Yesterday",
  },
];

export default function RequestsPage() {
  const { isSidebarCollapsed, showToast } = useTaskContext();
  const [requests, setRequests] = useState(SAMPLE_REQUESTS);

  const handleApprove = (req: ClientRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast(
      "Request Approved & Scheduled",
      `"${req.title}" has been moved to sprint production.`,
      "success"
    );
  };

  const handleDecline = (req: ClientRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast("Request Declined", `Notified ${req.clientName}.`, "info");
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Client Intake & Design Requests"
        subtitle="Review inbound creative briefs, estimate turnaround time, and convert briefs directly into scheduled deliverables."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9B3FB]/40 text-[#3B0270] border border-[#E9B3FB]">
            {requests.length} Pending Approval
          </span>
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          title="Intake queue is clear"
          description="All incoming client briefs have been reviewed and scheduled into team sprints."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#F0E6F3]">
                      <Image
                        src={req.clientAvatar}
                        alt={req.clientName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#241A33]">{req.clientName}</h4>
                      <span className="text-[10px] text-[#837C8D] font-mono">
                        Submitted {req.submittedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF7FC] text-[#3B0270] border border-[#F0E6F3]">
                      {req.discipline}
                    </span>
                    {req.urgency === "urgent" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D84B66]/10 text-[#D84B66] border border-[#D84B66]/20">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#241A33] leading-snug">
                  {req.title}
                </h3>
                <p className="text-xs text-[#837C8D] mt-2 leading-relaxed">
                  {req.description}
                </p>

                {/* Deliverable items checklist */}
                <div className="mt-4 p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
                  <p className="text-[11px] font-semibold text-[#241A33] uppercase tracking-wider mb-2">
                    Scope of Deliverables:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#241A33]">
                    {req.deliverableItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6F00FF]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-5 pt-3 border-t border-[#F0E6F3] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#837C8D]">
                  <Clock className="w-3.5 h-3.5 text-[#6F00FF]" />
                  <span>Target: <strong className="text-[#241A33]">{req.deadlineRequested}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(req)}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(req)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Schedule</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

