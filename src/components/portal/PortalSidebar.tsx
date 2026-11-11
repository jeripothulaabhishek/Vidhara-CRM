"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  CalendarDays,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface PortalNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  highlight?: boolean;
}

const PORTAL_NAV: PortalNavItem[] = [
  { label: "Overview", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "My Deliverables", href: "/portal/tasks", icon: Layers },
  { label: "New Request", href: "/portal/tasks/new", icon: PlusCircle, highlight: true },
  { label: "Schedule & Deadlines", href: "/portal/calendar", icon: CalendarDays },
  { label: "Notifications", href: "/portal/notifications", icon: Bell },
  { label: "Settings", href: "/portal/settings", icon: Settings },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, unreadCount, currentUser, showToast } =
    useTaskContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = currentUser || CURRENT_USER;

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    showToast("Signed Out", "You have signed out of Vidhara Dashboard.", "info");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#190E26] text-white shadow-lg"
        aria-label="Open portal sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop */}
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
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="relative p-5 flex items-center justify-between border-b border-[#2C1942]">
            <Link
              href="/portal/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6F00FF] via-[#9D4EFF] to-[#E9B3FB] flex items-center justify-center shrink-0 shadow-lg shadow-[#6F00FF]/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              {!isSidebarCollapsed && (
                <div className="min-w-0 transition-opacity">
                  <span className="text-sm font-extrabold tracking-tight text-white block leading-tight">
                    VIDHARA
                  </span>
                  <span className="text-[10px] font-semibold text-[#E9B3FB] uppercase tracking-wider block">
                    Client Portal
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {PORTAL_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal/dashboard"
                  ? pathname === "/portal/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative group",
                    isActive
                      ? "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-md shadow-[#6F00FF]/25"
                      : item.highlight
                      ? "bg-[#6F00FF]/15 text-[#E9B3FB] hover:bg-[#6F00FF]/25 border border-[#6F00FF]/30"
                      : "text-[#A69BB5] hover:text-white hover:bg-[#251538]"
                  )}
                  title={item.label}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive
                        ? "text-white"
                        : item.highlight
                        ? "text-[#E9B3FB]"
                        : "text-[#837C8D]"
                    )}
                  />

                  {!isSidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}

                  {!isSidebarCollapsed && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6F00FF]/30 text-[#E9B3FB]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-[#2C1942] space-y-2">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-2xl bg-[#221333] border border-[#351C50]",
              isSidebarCollapsed && "justify-center p-1.5"
            )}
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#6F00FF] shrink-0">
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                fill
                className="object-cover"
              />
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <span className="text-[10px] text-[#E9B3FB] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#16865C]" />
                  Verified Member
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
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
