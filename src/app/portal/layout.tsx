import React from "react";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopNavbar } from "@/components/portal/PortalTopNavbar";

export const metadata = {
  title: "Client Portal | Vidhara Dashboard",
  description: "Private creative agency workspace, task submission, and deliverable review.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF1F1] text-[#241A33] selection:bg-[#E9B3FB] selection:text-[#3B0270]">
      {/* Dedicated Portal Navigation */}
      <PortalSidebar />
      <PortalTopNavbar />

      {/* Main Page Content */}
      <div className="flex-1 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

