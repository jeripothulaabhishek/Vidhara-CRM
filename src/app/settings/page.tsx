"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CURRENT_USER } from "@/lib/mock-data";
import { Palette, Shield, Database, Bell, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND_PALETTE = [
  { name: "Primary Background", hex: "#FFF1F1", textDark: true },
  { name: "Soft Lavender", hex: "#E9B3FB", textDark: true },
  { name: "Primary Purple", hex: "#6F00FF", textDark: false },
  { name: "Deep Purple", hex: "#3B0270", textDark: false },
  { name: "Main Text", hex: "#241A33", textDark: false },
  { name: "Secondary Text", hex: "#837C8D", textDark: false },
  { name: "Soft Borders", hex: "#F0E6F3", textDark: true },
  { name: "Success Accent", hex: "#16865C", textDark: false },
];

export default function SettingsPage() {
  const { isSidebarCollapsed, showToast } = useTaskContext();
  const [studioName, setStudioName] = useState("Vidhara Design Agency");
  const [clientPortalUrl, setClientPortalUrl] = useState("https://portal.vidhara.design");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reviewPush, setReviewPush] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings Saved", "Your studio preferences and tokens have been updated.", "success");
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-12 pt-2",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Settings & Design System"
        subtitle="Configure agency branding, palette tokens, Supabase backend status, and studio workflow preferences."
      />

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* BRAND PALETTE FOUNDATION (Reference Image 3 Showcase) */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241A33]">
                Design System Color Palette (Reference Foundation)
              </h3>
              <p className="text-xs text-[#837C8D]">
                Active color tokens configured in Tailwind and CSS variables
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {BRAND_PALETTE.map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-2xl border border-[#F0E6F3] flex flex-col justify-between h-24 shadow-2xs"
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className={cn(
                    "text-[11px] font-bold leading-tight",
                    c.textDark ? "text-[#241A33]" : "text-white"
                  )}
                >
                  {c.name}
                </span>
                <span
                  className={cn(
                    "text-xs font-mono font-semibold",
                    c.textDark ? "text-[#241A33]/80" : "text-white/90"
                  )}
                >
                  {c.hex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Workspace Information */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#241A33]">Studio Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Agency Studio Name
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full h-10 px-3.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs md:text-sm text-[#241A33] outline-none focus:border-[#6F00FF] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Client Portal Custom Domain
              </label>
              <input
                type="url"
                value={clientPortalUrl}
                onChange={(e) => setClientPortalUrl(e.target.value)}
                className="w-full h-10 px-3.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs md:text-sm text-[#241A33] outline-none focus:border-[#6F00FF] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Supabase Database Connection Status */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16865C]/10 text-[#16865C] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241A33]">
                Supabase Architecture & Schema
              </h3>
              <p className="text-xs text-[#837C8D]">
                Connected with @supabase/ssr, browser client, server client, and type mappings
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16865C] inline-block" />
                <span className="text-xs font-bold text-[#241A33]">Supabase SDK Ready</span>
              </div>
              <p className="text-[11px] text-[#837C8D] mt-0.5">
                Existing tables preserved: profiles, clients, tasks, task_pins, reviews.
              </p>
            </div>
            <span className="text-xs font-mono text-[#6F00FF] font-semibold bg-[#6F00FF]/10 px-2.5 py-1 rounded-xl">
              @supabase/ssr v0.5.1
            </span>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#241A33]">Alert Notifications</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#241A33]">Client Approval Push Alerts</p>
                <p className="text-[11px] text-[#837C8D]">Receive instantaneous alerts when clients sign off on proofs</p>
              </div>
              <input
                type="checkbox"
                checked={reviewPush}
                onChange={(e) => setReviewPush(e.target.checked)}
                className="w-4 h-4 rounded text-[#6F00FF] focus:ring-[#6F00FF]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#241A33]">Daily Morning Schedule Digest</p>
                <p className="text-[11px] text-[#837C8D]">Receive morning email with today&apos;s timeline and pins at 08:00 AM</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#6F00FF] focus:ring-[#6F00FF]"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg">
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </form>
    </main>
  );
}

