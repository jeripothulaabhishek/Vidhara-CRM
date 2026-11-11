"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useTaskContext();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-2xl border transition-all duration-200",
          isOpen
            ? "bg-[#6F00FF]/10 border-[#6F00FF] text-[#6F00FF]"
            : "bg-white border-[#F0E6F3] text-[#241A33] hover:border-[#E9B3FB] hover:text-[#6F00FF]"
        )}
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6F00FF] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 md:w-96 rounded-3xl glass-popover border border-[#F0E6F3] shadow-2xl p-4 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#241A33]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#6F00FF]/10 text-[#6F00FF]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#6F00FF] hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 p-1 bg-[#FAF7FC] rounded-xl my-2.5 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-1 px-2.5 rounded-lg font-medium transition-all",
                activeTab === "all" ? "bg-white text-[#6F00FF] shadow-xs" : "text-[#837C8D] hover:text-[#241A33]"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 py-1 px-2.5 rounded-lg font-medium transition-all",
                activeTab === "unread" ? "bg-white text-[#6F00FF] shadow-xs" : "text-[#837C8D] hover:text-[#241A33]"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#837C8D]">
                No notifications to display
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={cn(
                    "p-3 rounded-2xl text-left transition-all border cursor-pointer hover:border-[#E9B3FB]",
                    notif.is_read
                      ? "bg-white border-[#F0E6F3] opacity-75"
                      : "bg-[#FFF1F1]/50 border-[#E9B3FB]/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#241A33] flex items-center gap-1.5">
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6F00FF] inline-block shrink-0" />
                      )}
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#837C8D] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {notif.created_at}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#837C8D] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.action_url && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6F00FF] font-medium hover:underline">
                      <Link href={notif.action_url} onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1">
                        View item <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

