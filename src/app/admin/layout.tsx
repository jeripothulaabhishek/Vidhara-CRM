"use client";

import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Toaster } from "@/components/ui/Toast";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed } = useTaskContext();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFF1F1]">
      {/* Admin Dedicated Sidebar */}
      <AdminSidebar />

      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {children}
      </div>

      {/* Modals and notifications */}
      <CreateTaskDialog />
      <TaskDetailModal />
      <CommandPalette />
      <Toaster />
    </div>
  );
}

