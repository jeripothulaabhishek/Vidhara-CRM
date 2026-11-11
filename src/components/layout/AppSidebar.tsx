"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Inbox,
  CalendarDays,
  FileCheck2,
  Archive,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
  Menu,
  X,
} from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My Tasks", href: "/my-tasks", icon: CheckSquare },
  { label: "All Tasks", href: "/all-tasks", icon: Layers, adminOnly: true },
  { label: "New Requests", href: "/requests", icon: Inbox, badge: "3" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Review & Revisions", href: "/reviews", icon: FileCheck2, badge: "4" },
  { label: "Completed", href: "/completed", icon: Archive },
  { label: "Team Accounts", href: "/team", icon: Users, adminOnly: true },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, unreadCount, currentUser, showToast } = useTaskContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    showToast("Signed Out", "You have signed out of Vidhara Dashboard.", "info");
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#241A33] text-white shadow-lg"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-[#190E26] text-white transition-all duration-300 ease-in-out border-r border-[#2C1942] select-none",
          isSidebarCollapsed ? "w-20" : "w-64",
          // Mobile state
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="relative p-5 flex items-center justify-between border-b border-[#2C1942]">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6F00FF] via-[#9D4EFF] to-[#E9B3FB] flex items-center justify-center shrink-0 shadow-lg shadow-[#6F00FF]/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 transition-opacity">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  VIDHARA <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#6F00FF] text-white font-mono uppercase">CRM</span>
                </h1>
                <p className="text-[11px] text-[#A69BB5] truncate">Creative Studio</p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-7 h-7 rounded-xl bg-[#251538] hover:bg-[#6F00FF] hover:text-white text-[#A69BB5] items-center justify-center transition-colors border border-[#3C225B]"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#A69BB5] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {!isSidebarCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#796D8C] uppercase">
              Main Navigation
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            const badgeVal =
              item.href === "/notifications" && unreadCount > 0
                ? unreadCount
                : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-md shadow-[#6F00FF]/25 font-semibold"
                    : "text-[#B8AEC7] hover:text-white hover:bg-[#251538]"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-[#9E90B0] group-hover:text-[#E9B3FB]"
                  )}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}

                {/* Badges */}
                {!isSidebarCollapsed && badgeVal && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                      isActive
                        ? "bg-white text-[#3B0270]"
                        : "bg-[#6F00FF]/30 text-[#E9B3FB]"
                    )}
                  >
                    {badgeVal}
                  </span>
                )}

                {/* Collapsed dot badge */}
                {isSidebarCollapsed && badgeVal && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E9B3FB] ring-2 ring-[#190E26]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Footer Area */}
        <div className="p-3 border-t border-[#2C1942] space-y-2">
          {/* Admin Switcher pill if user is admin */}
          {(currentUser?.role === "admin" || currentUser?.role === ("ADMIN" as any)) && !isSidebarCollapsed && (
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6F00FF]/30 to-[#E9B3FB]/20 border border-[#6F00FF]/40 text-[11px] font-semibold text-[#E9B3FB] hover:border-[#E9B3FB] transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E9B3FB]" />
                Admin Dashboard
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* User Widget */}
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-2xl bg-[#221333] border border-[#351C50]",
              isSidebarCollapsed && "justify-center p-1.5"
            )}
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#6F00FF] shrink-0">
              <Image
                src={(currentUser || CURRENT_USER).avatar_url}
                alt={(currentUser || CURRENT_USER).full_name}
                fill
                className="object-cover"
              />
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {(currentUser || CURRENT_USER).full_name}
                </p>
                <p className="text-[10px] text-[#A69BB5] truncate">
                  {(currentUser || CURRENT_USER).agency_role?.split("&")[0] || "Creative Designer"}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={async () => {
              try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
              } catch {}
              showToast("Signed Out", "You have signed out of Vidhara Dashboard.", "info");
              window.location.href = "/login";
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-[#D84B66] hover:bg-[#D84B66]/10 transition-colors",
              isSidebarCollapsed && "justify-center px-0"
            )}
            title="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

