"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { FilePreview } from "../ui/FilePreview";
import { Button } from "../ui/Button";
import {
  X,
  Pin,
  Clock,
  Calendar,
  Sparkles,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Send,
  ExternalLink,
} from "lucide-react";
import { CATEGORY_COLORS, cn } from "@/lib/utils";
import { TaskStatus } from "@/types/database";

export function TaskDetailModal() {
  const {
    tasks,
    selectedTaskId,
    closeTaskDetail,
    updateTaskStatus,
    togglePinTask,
    deleteTask,
    addCommentToTask,
    showToast,
  } = useTaskContext();

  const [commentInput, setCommentInput] = useState("");
  const [localComments, setLocalComments] = useState<
    { id: string; user: string; text: string; time: string; avatar: string }[]
  >([
    {
      id: "c1",
      user: "Alex Rivera",
      text: "Please verify Apple Pay biometric token exchange and error state styling before submitting for client signoff.",
      time: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  ]);

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const catStyle = CATEGORY_COLORS[task.category] || {
    bg: "bg-[#FAF7FC]",
    text: "text-[#241A33]",
    border: "border-[#F0E6F3]",
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      user: "Alex Rivera",
      text: commentInput.trim(),
      time: "Just now",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };

    setLocalComments((prev) => [...prev, newComment]);
    addCommentToTask(task.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A33]/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeTaskDetail}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white border border-[#F0E6F3] rounded-3xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E6F3]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                catStyle.bg,
                catStyle.text,
                catStyle.border
              )}
            >
              {task.category}
            </span>
            <PriorityBadge priority={task.priority} size="sm" />
            <TaskStatusBadge status={task.status} size="sm" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => togglePinTask(task.id)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                task.is_pinned
                  ? "bg-[#6F00FF]/10 text-[#6F00FF]"
                  : "text-[#837C8D] hover:bg-[#FAF7FC]"
              )}
              title={task.is_pinned ? "Unpin task" : "Pin to weekly priorities"}
            >
              <Pin className={cn("w-4 h-4", task.is_pinned && "fill-current")} />
            </button>

            <button
              onClick={closeTaskDetail}
              className="p-2 rounded-xl text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task Title & Client Banner */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-[#241A33] leading-snug">
            {task.title}
          </h2>

          <div className="flex items-center gap-4 mt-3 text-xs text-[#837C8D] flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6F00FF]" />
              <span>Due: <strong className="text-[#241A33]">{task.due_date}</strong></span>
            </div>

            {task.scheduled_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6F00FF]" />
                <span>Slot: <strong className="text-[#241A33]">{task.scheduled_time} ({task.duration_minutes || 60}m)</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6F00FF]" />
              <span>Client: <strong className="text-[#241A33]">{task.client.brand_name}</strong></span>
            </div>
          </div>
        </div>

        {/* Deliverable preview image if available */}
        {task.deliverable_preview && (
          <div className="relative w-full h-56 rounded-2xl overflow-hidden mt-4 border border-[#F0E6F3]">
            <Image
              src={task.deliverable_preview}
              alt={task.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Description / Creative Brief */}
        <div className="mt-5 p-4 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
          <h4 className="text-xs font-bold text-[#241A33] uppercase tracking-wider mb-1.5">
            Creative Brief & Scope
          </h4>
          <p className="text-xs md:text-sm text-[#241A33]/90 leading-relaxed">
            {task.description || "No specific brief provided."}
          </p>

          {task.pin_note && (
            <div className="mt-3 pt-3 border-t border-[#F0E6F3] text-xs text-[#3B0270] flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6F00FF] shrink-0 mt-0.5" />
              <span><strong>Weekly Focus:</strong> {task.pin_note}</span>
            </div>
          )}
        </div>

        {/* Assigned Team & Client Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-white border border-[#F0E6F3] flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-[#F0E6F3] shrink-0">
              <Image
                src={task.assigned_to.avatar_url}
                alt={task.assigned_to.full_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#837C8D] uppercase font-semibold">Assigned Designer</span>
              <p className="text-xs font-bold text-[#241A33]">{task.assigned_to.full_name}</p>
              <p className="text-[10px] text-[#6F00FF]">{task.assigned_to.agency_role}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#F0E6F3] flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-[#F0E6F3] shrink-0">
              <Image
                src={task.client.logo_url}
                alt={task.client.brand_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#837C8D] uppercase font-semibold">Client Organization</span>
              <p className="text-xs font-bold text-[#241A33]">{task.client.brand_name}</p>
              <p className="text-[10px] text-[#837C8D] capitalize">{task.client.tier} Retainer</p>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-bold text-[#241A33] uppercase tracking-wider">
              Deliverable Files ({task.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.attachments.map((att) => (
                <FilePreview key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        )}

        {/* Comments & Revision Feedback Thread */}
        <div className="mt-5 pt-4 border-t border-[#F0E6F3] space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#6F00FF]" />
            <h4 className="text-xs font-bold text-[#241A33] uppercase tracking-wider">
              Feedback & Annotations ({localComments.length})
            </h4>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {localComments.map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image src={c.avatar} alt={c.user} fill className="object-cover" />
                    </div>
                    <span className="font-semibold text-[#241A33]">{c.user}</span>
                  </div>
                  <span className="text-[10px] text-[#837C8D]">{c.time}</span>
                </div>
                <p className="text-[#241A33]/90 pl-7 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Post design feedback or mention client..."
              className="flex-1 h-10 px-3.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] outline-none focus:border-[#6F00FF] focus:bg-white transition-all"
            />
            <Button type="submit" variant="primary" size="md">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#F0E6F3] flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              deleteTask(task.id);
              closeTaskDetail();
            }}
            className="text-[#D84B66] hover:bg-[#D84B66]/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
              className="h-9 px-3 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#241A33] outline-none cursor-pointer hover:border-[#6F00FF]"
            >
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="revision">Revision</option>
              <option value="completed">Completed</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                updateTaskStatus(task.id, "completed");
                closeTaskDetail();
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

