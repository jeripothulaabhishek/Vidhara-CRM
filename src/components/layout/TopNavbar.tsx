"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronRight, Home, SlidersHorizontal } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { SearchInput } from "../ui/SearchInput";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { ProfileDropdown } from "../ui/ProfileDropdown";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Overview",
  "/my-tasks": "My Tasks",
  "/all-tasks": "All Tasks",
  "/requests": "New Requests",
  "/calendar": "Calendar & Timeline",
  "/reviews": "Review & Revisions",
  "/completed": "Completed Projects",
  "/team": "Team Accounts",
  "/notifications": "Notifications",
  "/settings": "Settings & Studio",
};

export function TopNavbar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setIsCreateTaskOpen } = useTaskContext();

  // Hide on admin routes, portal routes, and auth screens
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/invite"
  ) {
    return null;
  }

  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300 py-3 px-4 md:px-8",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <div className="glass-panel rounded-3xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm border border-[#F0E6F3]">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-xl text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FFF1F1] transition-colors"
            title="Overview"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#837C8D]/60 shrink-0" />
          <span className="text-xs md:text-sm font-semibold text-[#241A33] truncate">
            {currentLabel}
          </span>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchInput />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Create Task Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateTaskOpen(true)}
            className="shadow-sm shadow-[#6F00FF]/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Task</span>
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile Menu */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

