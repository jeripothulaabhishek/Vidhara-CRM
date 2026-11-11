import type { Metadata } from "next";
import "./globals.css";
import { TaskProvider } from "@/context/TaskContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Toaster } from "@/components/ui/Toast";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CommandPalette } from "@/components/ui/CommandPalette";

export const metadata: Metadata = {
  title: "VIDHARA DASHBOARD — Creative Agency CRM & Task Management",
  description: "A premier design agency task orchestration and client deliverables platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FFF1F1] text-[#241A33] min-h-screen">
        <TaskProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Left Desktop & Mobile Sidebar */}
            <AppSidebar />

            {/* Top Navbar */}
            <TopNavbar />

            {/* Main Content Body */}
            <div className="flex-1 transition-all duration-300">
              {children}
            </div>

            {/* Global Modals & Notifications */}
            <CreateTaskDialog />
            <TaskDetailModal />
            <CommandPalette />
            <Toaster />
          </div>
        </TaskProvider>
      </body>
    </html>
  );
}
