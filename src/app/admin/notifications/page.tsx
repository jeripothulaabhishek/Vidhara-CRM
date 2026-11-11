"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useTaskContext } from "@/context/TaskContext";
import { Bell, CheckCheck, Clock, Shield, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, markAllNotificationsRead, markNotificationRead } = useTaskContext();
  const [filter, setFilter] = useState("all");

  const displayed = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      <PageHeader
        title="Admin Notifications & Realtime Alerts"
        subtitle="Live agency event stream: client revisions, submissions, and critical project deadlines."
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

      <div className="space-y-3 max-w-3xl">
        {displayed.map((item) => (
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
                  item.is_read ? "bg-[#FAF7FC] text-[#837C8D]" : "bg-[#6F00FF]/10 text-[#6F00FF]"
                )}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#241A33]">{item.title}</h4>
                  {!item.is_read && <span className="w-2 h-2 rounded-full bg-[#6F00FF]" />}
                </div>
                <p className="text-xs text-[#837C8D] mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-[#837C8D] font-mono shrink-0">
              {item.created_at}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

