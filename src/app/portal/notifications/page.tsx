"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export default function MemberNotificationsPage() {
  const { isSidebarCollapsed, showToast } = useTaskContext();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (data) setNotifications(data as NotificationRow[]);
        }
      } catch (err) {
        console.error("Notifications load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();

    // Supabase Realtime subscription for member notifications
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("member-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            setNotifications((prev) => [payload.new as NotificationRow, ...prev]);
            showToast("New Notification", (payload.new as any).title, "info");
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {}
  }, [showToast]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      const supabase = createClient();
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch {}
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast("Notifications Cleared", "All notifications marked as read.", "success");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id);
      }
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.is_read : true));

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2 max-w-4xl mx-auto",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Notifications Center"
        subtitle="Real-time studio dispatches, deliverable handoffs, and feedback updates from your agency team."
        badge={
          unreadCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6F00FF]/10 text-[#6F00FF] border border-[#6F00FF]/20">
              {unreadCount} Unread
            </span>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-white border border-[#F0E6F3] p-0.5">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  filter === "all" ? "bg-[#FAF7FC] text-[#241A33]" : "text-[#837C8D]"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  filter === "unread" ? "bg-[#FAF7FC] text-[#6F00FF]" : "text-[#837C8D]"
                )}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <Button variant="secondary" size="md" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="rounded-3xl bg-white border border-[#F0E6F3] shadow-sm divide-y divide-[#F0E6F3] overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((n) => {
            return (
              <div
                key={n.id}
                className={cn(
                  "p-4 md:p-5 flex items-start justify-between gap-4 transition-colors",
                  !n.is_read ? "bg-[#FAF1FD]/40" : "hover:bg-[#FAF7FC]/50"
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
                      !n.is_read ? "bg-[#6F00FF] text-white" : "bg-[#FAF7FC] text-[#837C8D]"
                    )}
                  >
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs md:text-sm font-bold text-[#241A33]">
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#6F00FF]" />
                      )}
                    </div>
                    <p className="text-xs text-[#837C8D] mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-[#837C8D] mt-1.5 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.action_url && (
                    <Link
                      href={n.action_url}
                      onClick={() => markAsRead(n.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-semibold text-[#6F00FF] flex items-center gap-1 transition-all"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 rounded-xl text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC] text-xs transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF1FD] text-[#6F00FF] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#241A33]">Inbox is Clear</h4>
            <p className="text-xs text-[#837C8D] max-w-xs mx-auto">
              You are all caught up on deliverable feedback, revision updates, and file handoffs.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
