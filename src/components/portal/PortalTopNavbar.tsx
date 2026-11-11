"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronRight, Home, Sparkles } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { SearchInput } from "../ui/SearchInput";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { ProfileDropdown } from "../ui/ProfileDropdown";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

const PORTAL_ROUTE_LABELS: Record<string, string> = {
  "/portal/dashboard": "Client Dashboard",
  "/portal/tasks": "My Deliverables",
  "/portal/tasks/new": "Submit Design Request",
  "/portal/calendar": "Schedule & Deadlines",
  "/portal/notifications": "Notifications Center",
  "/portal/settings": "Account Settings",
};

export function PortalTopNavbar() {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useTaskContext();

  const currentLabel = PORTAL_ROUTE_LABELS[pathname] || "Portal Workspace";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300 py-3 px-4 md:px-8",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <div className="glass-panel rounded-3xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm border border-[#F0E6F3]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/portal/dashboard"
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

        {/* Center Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchInput placeholder="Search your creative requests, briefs, assets..." />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/portal/tasks/new">
            <Button
              variant="primary"
              size="md"
              className="shadow-sm shadow-[#6F00FF]/30 bg-gradient-to-r from-[#6F00FF] to-[#3B0270]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Request</span>
            </Button>
          </Link>

          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
