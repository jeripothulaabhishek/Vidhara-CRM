"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  Inbox,
  Clock,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "All Tasks", href: "/admin/tasks", icon: Layers },
  { label: "New Requests", href: "/admin/tasks?status=NEW", icon: Inbox, badge: "3" },
  { label: "In Progress", href: "/admin/tasks?status=IN_PROGRESS", icon: Clock },
  { label: "Review & Revisions", href: "/admin/tasks?status=IN_REVIEW", icon: FileCheck2, badge: "2" },
  { label: "Completed", href: "/admin/tasks?status=COMPLETED", icon: CheckCircle2 },
  { label: "Calendar", href: "/admin/calendar", icon: Calendar },
  { label: "Team Accounts", href: "/admin/team", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, unreadCount, showToast } = useTaskContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#190E26] text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-[#190E26] text-white transition-all duration-300 ease-in-out border-r border-[#2C1942] select-none",
          isSidebarCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="relative p-5 flex items-center justify-between border-b border-[#2C1942]">
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6F00FF] via-[#9D4EFF] to-[#E9B3FB] flex items-center justify-center shrink-0 shadow-lg shadow-[#6F00FF]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  VIDHARA <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#D84B66] text-white font-mono uppercase font-bold">ADMIN</span>
                </h1>
                <p className="text-[11px] text-[#A69BB5] truncate">Control Center</p>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-7 h-7 rounded-xl bg-[#251538] hover:bg-[#6F00FF] text-[#A69BB5] hover:text-white items-center justify-center transition-colors border border-[#3C225B]"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#A69BB5] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {!isSidebarCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#796D8C] uppercase">
              Admin CRM Navigation
            </p>
          )}

          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href.split("?")[0];

            return (
              <Link
                key={item.label}
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

                {!isSidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6F00FF]/30 text-[#E9B3FB]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2C1942] space-y-2">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-2xl bg-[#221333] border border-[#351C50]",
              isSidebarCollapsed && "justify-center p-1.5"
            )}
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#6F00FF] shrink-0">
              <Image
                src={CURRENT_USER.avatar_url}
                alt={CURRENT_USER.full_name}
                fill
                className="object-cover"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {CURRENT_USER.full_name}
                </p>
                <span className="text-[10px] text-[#E9B3FB] font-semibold">
                  Agency Owner
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
