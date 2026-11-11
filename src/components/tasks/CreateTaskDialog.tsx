"use client";

import React, { useState } from "react";
import { X, Sparkles, Calendar, Clock, Tag, Flag } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { CreativeCategory, TaskPriority } from "@/types/database";
import { CLIENT_COMPANIES } from "@/lib/mock-data";
import { Button } from "../ui/Button";

export function CreateTaskDialog() {
  const { isCreateTaskOpen, setIsCreateTaskOpen, createTask } = useTaskContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState(CLIENT_COMPANIES[0].brand_name);
  const [category, setCategory] = useState<CreativeCategory>("Branding & Identity");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueDate, setDueDate] = useState("2026-11-12");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [pinToWeek, setPinToWeek] = useState(false);
  const [pinNote, setPinNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isCreateTaskOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask({
        title,
        description,
        clientName,
        category,
        priority,
        dueDate,
        scheduledTime,
        durationMinutes,
        pinToWeek,
        pinNote: pinNote || undefined,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPinToWeek(false);
      setPinNote("");
      setIsCreateTaskOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A33]/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCreateTaskOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-white border border-[#F0E6F3] rounded-3xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E6F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#6F00FF] to-[#3B0270] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241A33]">Create Design Deliverable</h3>
              <p className="text-xs text-[#837C8D]">Assign creative tasks and schedule timeline</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(false)}
            className="p-1.5 rounded-xl text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Task / Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3D Isometric App Icon Set & Brand Tokens"
              className="w-full h-11 px-3.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-sm text-[#241A33] placeholder:text-[#837C8D] focus:border-[#6F00FF] focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Client & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">Client</label>
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs md:text-sm text-[#241A33] focus:border-[#6F00FF] focus:bg-white outline-none cursor-pointer"
              >
                {CLIENT_COMPANIES.map((c) => (
                  <option key={c.id} value={c.brand_name}>
                    {c.brand_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">Discipline</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CreativeCategory)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs md:text-sm text-[#241A33] focus:border-[#6F00FF] focus:bg-white outline-none cursor-pointer"
              >
                <option value="Branding & Identity">Branding & Identity</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="3D & Motion">3D & Motion</option>
                <option value="Social Media Kit">Social Media Kit</option>
                <option value="Pitch Deck & Presentation">Pitch Deck & Presentation</option>
                <option value="Packaging Design">Packaging Design</option>
              </select>
            </div>
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] focus:border-[#6F00FF] focus:bg-white outline-none cursor-pointer"
              >
                <option value="urgent">Urgent 🔥</option>
                <option value="high">High ⚡</option>
                <option value="medium">Medium 📌</option>
                <option value="low">Low 💤</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] focus:border-[#6F00FF] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">Timeline Slot</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] focus:border-[#6F00FF] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Design Brief & Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline creative guidelines, Figma links, render dimensions or revision notes..."
              className="w-full p-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs md:text-sm text-[#241A33] placeholder:text-[#837C8D] focus:border-[#6F00FF] focus:bg-white outline-none transition-all resize-none"
            />
          </div>

          {/* Pin to Weekly Highlights */}
          <div className="p-3.5 rounded-2xl bg-[#FFF1F1]/70 border border-[#E9B3FB]/60 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pinToWeek}
                onChange={(e) => setPinToWeek(e.target.checked)}
                className="w-4 h-4 rounded text-[#6F00FF] focus:ring-[#6F00FF]"
              />
              <span className="text-xs font-semibold text-[#3B0270]">
                Pin to Weekly Priority Panel (Reference Image 1)
              </span>
            </label>

            {pinToWeek && (
              <input
                type="text"
                value={pinNote}
                onChange={(e) => setPinNote(e.target.value)}
                placeholder="Key focus note (e.g. 'Deliver responsive icon grid & token specs')"
                className="w-full h-9 px-3 bg-white border border-[#E9B3FB] rounded-xl text-xs text-[#241A33] placeholder:text-[#837C8D] focus:border-[#6F00FF] outline-none"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#F0E6F3]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Create & Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

