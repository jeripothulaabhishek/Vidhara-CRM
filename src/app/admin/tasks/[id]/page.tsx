"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { FilePreview } from "@/components/ui/FilePreview";
import { useTaskContext } from "@/context/TaskContext";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  History,
  CheckCircle2,
  RotateCcw,
  Upload,
  AlertCircle,
  ExternalLink,
  Shield,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/database";

export default function AdminTaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { tasks, updateTaskStatus, showToast } = useTaskContext();

  const task = tasks.find((t) => t.id === taskId) || tasks[0];

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "Alex Rivera (Admin)",
      text: "Initial brand moodboard approved. Ensure neon violet gradients match Figma tokens.",
      time: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "Alex Rivera (Admin)",
        text: commentText.trim(),
        time: "Just now",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    ]);
    setCommentText("");
    showToast("Comment Recorded", "Feedback logged to task audit trail.", "info");
  };

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#837C8D] hover:text-[#6F00FF] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Tasks</span>
        </Link>
      </div>

      <PageHeader
        title={task.title}
        subtitle={`Task ID: ${task.id} • Created for ${task.client.brand_name}`}
        badge={
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                updateTaskStatus(task.id, "revision");
                showToast("Revision Requested", `Notified assigned designer for ${task.title}.`, "warning");
              }}
            >
              <RotateCcw className="w-4 h-4 text-[#D99516]" />
              <span>Request Revision</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                updateTaskStatus(task.id, "completed");
                showToast("Task Signoff", `Deliverable marked as completed.`, "success");
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Deliver</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Brief & Deliverable Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Creative Brief Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider">
              Creative Brief & Specifications
            </h3>
            <p className="text-sm text-[#241A33]/90 leading-relaxed">
              {task.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F0E6F3] text-xs">
              <div>
                <span className="text-[#837C8D] block text-[10px] uppercase font-semibold">Platform</span>
                <strong className="text-[#241A33]">Web & iOS</strong>
              </div>
              <div>
                <span className="text-[#837C8D] block text-[10px] uppercase font-semibold">Dimensions</span>
                <strong className="text-[#241A33]">1920x1080 / 4K</strong>
              </div>
              <div>
                <span className="text-[#837C8D] block text-[10px] uppercase font-semibold">Assigned To</span>
                <strong className="text-[#241A33]">{task.assigned_to.full_name}</strong>
              </div>
              <div>
                <span className="text-[#837C8D] block text-[10px] uppercase font-semibold">Due Date</span>
                <strong className="text-[#6F00FF]">{task.due_date}</strong>
              </div>
            </div>
          </div>

          {/* Deliverables & Preview */}
          {task.deliverable_preview && (
            <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider">
                  Deliverable Proof Visualizer
                </h3>
                <span className="text-xs text-[#837C8D]">High Resolution Preview</span>
              </div>
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-[#F0E6F3]">
                <Image
                  src={task.deliverable_preview}
                  alt={task.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Reference Files & Uploads */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider">
                Attached Reference Files & Proofs
              </h3>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF7FC] hover:bg-[#FFF1F1] text-[#6F00FF] border border-[#E9B3FB] transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Proof</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={() => showToast("File Uploaded", "Deliverable saved to task-files bucket.", "success")}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {task.attachments?.map((att) => (
                <FilePreview key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Comments & Audit Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status Control Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#241A33] uppercase tracking-wider">
              Status Transition
            </h4>
            <select
              value={task.status}
              onChange={(e) => {
                updateTaskStatus(task.id, e.target.value as TaskStatus);
                showToast("Status Updated", `Task moved to ${e.target.value.toUpperCase()}.`, "info");
              }}
              className="w-full h-10 px-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer hover:border-[#6F00FF]"
            >
              <option value="NEW">NEW (Awaiting Triage)</option>
              <option value="ACCEPTED">ACCEPTED (Approved for Sprint)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Under Active Design)</option>
              <option value="IN_REVIEW">IN_REVIEW (Client Proofing)</option>
              <option value="REVISION">REVISION (Changes Required)</option>
              <option value="COMPLETED">COMPLETED (Signoff Finalized)</option>
              <option value="REJECTED">REJECTED (Declined Request)</option>
            </select>
          </div>

          {/* Conversation & Revision Notes */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0E6F3]">
              <MessageSquare className="w-4 h-4 text-[#6F00FF]" />
              <h4 className="text-xs font-bold text-[#241A33]">Discussion & Annotations</h4>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#241A33]">{c.author}</span>
                    <span className="text-[10px] text-[#837C8D]">{c.time}</span>
                  </div>
                  <p className="text-[#241A33]/90 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write feedback note..."
                className="flex-1 h-9 px-3 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs outline-none focus:border-[#6F00FF]"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
