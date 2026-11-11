"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskContext } from "@/context/TaskContext";
import {
  Search,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Layers,
  Inbox,
  FileCheck2,
  Archive,
  Users,
  Settings,
  Plus,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Actions" | "Deliverables";
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { tasks, setIsCreateTaskOpen, openTaskDetail, markAllNotificationsRead } = useTaskContext();

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems: CommandItem[] = [
    {
      id: "nav-overview",
      title: "Overview Dashboard",
      subtitle: "Creative control center & daily schedule",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => {
        router.push("/");
        setIsOpen(false);
      },
    },
    {
      id: "nav-calendar",
      title: "Studio Calendar",
      subtitle: "Seven-column weekly production timeline",
      category: "Navigation",
      icon: Calendar,
      action: () => {
        router.push("/calendar");
        setIsOpen(false);
      },
    },
    {
      id: "nav-my-tasks",
      title: "My Deliverables",
      subtitle: "Personal sprint queue & task lists",
      category: "Navigation",
      icon: CheckSquare,
      action: () => {
        router.push("/my-tasks");
        setIsOpen(false);
      },
    },
    {
      id: "nav-all-tasks",
      title: "Master Task Pipeline",
      subtitle: "5-stage Kanban board (Admin)",
      category: "Navigation",
      icon: Layers,
      action: () => {
        router.push("/all-tasks");
        setIsOpen(false);
      },
    },
    {
      id: "nav-reviews",
      title: "Review & Revisions",
      subtitle: "Client proofing & annotation feedback",
      category: "Navigation",
      icon: FileCheck2,
      action: () => {
        router.push("/reviews");
        setIsOpen(false);
      },
    },
    {
      id: "nav-requests",
      title: "Inbound Client Requests",
      subtitle: "Intake portal & design briefs",
      category: "Navigation",
      icon: Inbox,
      action: () => {
        router.push("/requests");
        setIsOpen(false);
      },
    },
    {
      id: "nav-completed",
      title: "Completed Archive",
      subtitle: "Delivered creative assets & handoffs",
      category: "Navigation",
      icon: Archive,
      action: () => {
        router.push("/completed");
        setIsOpen(false);
      },
    },
    {
      id: "nav-team",
      title: "Team Roster",
      subtitle: "Designer allocations & capacity meters",
      category: "Navigation",
      icon: Users,
      action: () => {
        router.push("/team");
        setIsOpen(false);
      },
    },
    {
      id: "nav-settings",
      title: "Studio Settings & Tokens",
      subtitle: "Color palette and workspace settings",
      category: "Navigation",
      icon: Settings,
      action: () => {
        router.push("/settings");
        setIsOpen(false);
      },
    },
    {
      id: "act-create",
      title: "Create New Deliverable",
      subtitle: "Add task, assign designer, and schedule slot",
      category: "Actions",
      icon: Plus,
      action: () => {
        setIsOpen(false);
        setIsCreateTaskOpen(true);
      },
    },
  ];

  // Dynamic deliverables mapped from tasks
  const taskItems: CommandItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    subtitle: `${t.client.brand_name} • ${t.category} (${t.status})`,
    category: "Deliverables",
    icon: Sparkles,
    action: () => {
      setIsOpen(false);
      openTaskDetail(t.id);
    },
  }));

  const allItems = [...navItems, ...taskItems];

  const filteredItems = query.trim()
    ? allItems.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : navItems;

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A33]/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Box */}
      <div className="relative z-10 w-full max-w-xl bg-white border border-[#F0E6F3] rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[75vh]">
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0E6F3]">
          <Search className="w-5 h-5 text-[#837C8D] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command or search deliverables..."
            className="w-full bg-transparent text-sm text-[#241A33] placeholder:text-[#837C8D] outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#837C8D]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all",
                    isSelected
                      ? "bg-[#FAF1FD] text-[#6F00FF]"
                      : "text-[#241A33] hover:bg-[#FAF7FC]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-[#6F00FF] text-white"
                          : "bg-[#FAF7FC] text-[#837C8D]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#837C8D] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#837C8D] px-2 py-0.5 rounded-md bg-white border border-[#F0E6F3] shrink-0">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAF7FC] border-t border-[#F0E6F3] flex items-center justify-between text-[11px] text-[#837C8D]">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
            <span>•</span>
            <span>esc to close</span>
          </div>
          <span className="font-mono text-[#6F00FF]">Vidhara Spotlight</span>
        </div>
      </div>
    </div>
  );
}

