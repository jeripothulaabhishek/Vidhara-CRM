"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { FilePreview } from "@/components/ui/FilePreview";
import {
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofReview {
  id: string;
  taskTitle: string;
  clientName: string;
  version: string;
  category: string;
  previewUrl: string;
  designerName: string;
  designerAvatar: string;
  submittedTime: string;
  status: "pending_review" | "changes_requested" | "approved";
  feedbackNotes: string[];
  attachments: { id: string; name: string; size: string; type: "image" | "figma" | "pdf"; url: string }[];
}

const SAMPLE_REVIEWS: ProofReview[] = [
  {
    id: "rev-1",
    taskTitle: "Kroma Sparkling 3D Can Render & Material Study",
    clientName: "Kroma Bev Co.",
    version: "v2.1 Master Pass",
    category: "3D & Motion",
    previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=700&auto=format&fit=crop&q=80",
    designerName: "Jordan Chen",
    designerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    submittedTime: "3 hours ago",
    status: "pending_review",
    feedbackNotes: [
      "Condensation droplets look realistic. Increase specular highlight on the foil lid.",
      "Check contrast on the barcode side in physical print preview.",
    ],
    attachments: [
      { id: "a1", name: "Kroma_Can_TurnTable_4K.exr", size: "118 MB", type: "image", url: "#" },
      { id: "a2", name: "Packaging_DieLine_Approval.pdf", size: "14.2 MB", type: "pdf", url: "#" },
    ],
  },
  {
    id: "rev-2",
    taskTitle: "Lumina Mobile Checkout Flow & Biometrics",
    clientName: "Lumina Fintech",
    version: "v3.0 Interactive Prototype",
    category: "UI/UX Design",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80",
    designerName: "Maya Patel",
    designerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    submittedTime: "Yesterday",
    status: "changes_requested",
    feedbackNotes: [
      "Client requests Face ID glyph transition to fade 200ms faster.",
      "Add secondary failure toast for insufficient wallet balance.",
    ],
    attachments: [
      { id: "a3", name: "Lumina_Checkout_Handoff.fig", size: "22.5 MB", type: "figma", url: "#" },
    ],
  },
];

export default function ReviewsPage() {
  const { isSidebarCollapsed, showToast } = useTaskContext();
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const handleApprove = (revId: string, title: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, status: "approved" } : r))
    );
    showToast("Deliverable Approved", `"${title}" is signed off for final client delivery.`, "success");
  };

  const handleRequestChanges = (revId: string, title: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, status: "changes_requested" } : r))
    );
    showToast("Revision Requested", `Notified designer team for changes on "${title}".`, "warning");
  };

  const handleAddAnnotation = (revId: string) => {
    const text = newComment[revId];
    if (!text || !text.trim()) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId
          ? { ...r, feedbackNotes: [...r.feedbackNotes, text.trim()] }
          : r
      )
    );
    setNewComment((prev) => ({ ...prev, [revId]: "" }));
    showToast("Feedback Added", "Note attached to deliverable proof.", "info");
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Review & Creative Proofing"
        subtitle="Annotate design renders, approve final milestone deliverables, and manage client revision rounds."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20">
            {reviews.filter((r) => r.status !== "approved").length} Pending Proofs
          </span>
        }
      />

      <div className="space-y-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 md:p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left side: Visual Deliverable Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-[#F0E6F3] group">
                <Image
                  src={rev.previewUrl}
                  alt={rev.taskTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium">
                  {rev.version}
                </div>
              </div>

              {/* Attachments preview */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[#837C8D] uppercase tracking-wider">
                  Attached Deliverable Files ({rev.attachments.length})
                </p>
                {rev.attachments.map((att) => (
                  <FilePreview key={att.id} attachment={att} />
                ))}
              </div>
            </div>

            {/* Right side: Meta, Feedback Annotations & Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]">
                    {rev.category}
                  </span>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                      rev.status === "approved"
                        ? "bg-[#16865C]/10 text-[#16865C]"
                        : rev.status === "changes_requested"
                        ? "bg-[#D99516]/10 text-[#D99516]"
                        : "bg-[#6F00FF]/10 text-[#6F00FF]"
                    )}
                  >
                    {rev.status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#241A33]">{rev.taskTitle}</h3>
                <p className="text-xs text-[#837C8D] mt-0.5">
                  Client: <strong className="text-[#241A33]">{rev.clientName}</strong> • Submitted by {rev.designerName} ({rev.submittedTime})
                </p>

                {/* Feedback Annotations */}
                <div className="mt-4 p-4 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#241A33]">
                    <MessageSquare className="w-3.5 h-3.5 text-[#6F00FF]" />
                    <span>Revision Feedback & Annotations ({rev.feedbackNotes.length})</span>
                  </div>

                  <div className="space-y-2">
                    {rev.feedbackNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-[#F0E6F3] text-xs text-[#241A33] flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#6F00FF]/10 text-[#6F00FF] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{note}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add feedback note input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add design annotation or client note..."
                      value={newComment[rev.id] || ""}
                      onChange={(e) =>
                        setNewComment({ ...newComment, [rev.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAnnotation(rev.id);
                      }}
                      className="flex-1 h-9 px-3 rounded-xl bg-white border border-[#F0E6F3] text-xs text-[#241A33] outline-none focus:border-[#6F00FF]"
                    />
                    <Button
                      variant="lavender"
                      size="sm"
                      onClick={() => handleAddAnnotation(rev.id)}
                    >
                      Post Note
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#F0E6F3] flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleRequestChanges(rev.id, rev.taskTitle)}
                >
                  <RotateCcw className="w-4 h-4 text-[#D99516]" />
                  <span>Request Changes</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleApprove(rev.id, rev.taskTitle)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Signoff & Deliver</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

