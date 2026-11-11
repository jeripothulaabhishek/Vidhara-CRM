"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCheck, Clock, ExternalLink, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    isSidebarCollapsed,
  } = useTaskContext();

  const [filterType, setFilterType] = useState<string>("all");

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType !== "all") return n.type === filterType;
    return true;
  });

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Notification Center"
        subtitle="Stay updated on deliverable signoffs, client revisions, and upcoming deadline handoffs."
        badge={
          unreadCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20">
              {unreadCount} Unread
            </span>
          ) : undefined
        }
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="md" onClick={markAllNotificationsRead}>
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#F0E6F3] shadow-sm mb-6 text-xs overflow-x-auto">
        {["all", "unread", "review", "deadline", "assignment"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl capitalize font-medium transition-all whitespace-nowrap",
              filterType === tab
                ? "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-xs font-semibold"
                : "text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#F0E6F3] text-center text-xs text-[#837C8D]">
            No notifications in this category
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={cn(
                "p-4 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4",
                item.is_read
                  ? "bg-white border-[#F0E6F3] opacity-80"
                  : "bg-white border-[#E9B3FB] ring-1 ring-[#E9B3FB]/50 shadow-sm"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5",
                    item.is_read
                      ? "bg-[#FAF7FC] text-[#837C8D]"
                      : "bg-[#6F00FF]/10 text-[#6F00FF]"
                  )}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#241A33]">{item.title}</h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#6F00FF] inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-[#837C8D] mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {item.action_url && (
                    <div className="mt-2.5">
                      <Link
                        href={item.action_url}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#6F00FF] hover:underline"
                      >
                        <span>Open item</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-[#837C8D] font-mono shrink-0">
                {item.created_at}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

