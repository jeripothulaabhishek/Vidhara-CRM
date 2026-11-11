"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateMemberPassword } from "@/app/actions/portal";
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Bell,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MemberSettingsPage() {
  const { isSidebarCollapsed, currentUser, showToast } = useTaskContext();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [statusAlerts, setStatusAlerts] = useState(true);
  const [feedbackPings, setFeedbackPings] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateMemberPassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Security Updated", "Your account password has been changed.", "success");
    } else {
      setPasswordError(res.error || "Failed to update password.");
    }
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2 max-w-4xl mx-auto",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      <PageHeader
        title="Member Account Settings"
        subtitle="Manage your agency profile, credentials, and studio dispatch notification preferences."
      />

      <div className="space-y-6">
        {/* Profile Details Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <User className="w-4 h-4 text-[#6F00FF]" />
            <h3 className="text-sm font-bold text-[#241A33]">Client Profile</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-[#6F00FF]/20 shrink-0">
              <Image
                src={
                  currentUser?.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                }
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#241A33]">
                  {currentUser?.full_name || "Agency Client"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#16865C]" />
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-[#837C8D] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {currentUser?.email || "member@vidhara.design"}
              </p>
              <p className="text-xs font-semibold text-[#6F00FF]">
                {currentUser?.agency_role || "Design Requester"} • {currentUser?.department || "Creative Operations"}
              </p>
            </div>
          </div>

          {/* Role Immutability Note */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs text-[#837C8D]">
            <span className="font-semibold text-[#241A33]">Security Policy:</span> Account roles are governed by the agency administrator under Supabase Row Level Security. Role modifications are restricted to administrators.
          </div>
        </div>

        {/* Password Security Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <KeyRound className="w-4 h-4 text-[#6F00FF]" />
            <h3 className="text-sm font-bold text-[#241A33]">Change Password</h3>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-2xl bg-[#16865C]/10 border border-[#16865C]/20 text-xs text-[#16865C] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 text-xs text-[#D84B66] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Confirm New Password
              </label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingPassword}
              className="bg-[#6F00FF]"
            >
              <span>Update Password</span>
            </Button>
          </form>
        </div>

        {/* Notifications Preferences */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <Bell className="w-4 h-4 text-[#6F00FF]" />
            <h3 className="text-sm font-bold text-[#241A33]">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] cursor-pointer hover:border-[#E9B3FB] transition-all">
              <div>
                <p className="text-xs font-bold text-[#241A33]">Email Dispatches</p>
                <p className="text-[11px] text-[#837C8D]">
                  Receive notifications when deliverables are approved or files are ready
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#6F00FF] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] cursor-pointer hover:border-[#E9B3FB] transition-all">
              <div>
                <p className="text-xs font-bold text-[#241A33]">Deliverable Status Alerts</p>
                <p className="text-[11px] text-[#837C8D]">
                  Alerts when tasks move to Accepted, In Progress, or Revision
                </p>
              </div>
              <input
                type="checkbox"
                checked={statusAlerts}
                onChange={(e) => setStatusAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#6F00FF] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] cursor-pointer hover:border-[#E9B3FB] transition-all">
              <div>
                <p className="text-xs font-bold text-[#241A33]">Feedback Pings</p>
                <p className="text-[11px] text-[#837C8D]">
                  Real-time alerts when the agency director or designers leave a comment
                </p>
              </div>
              <input
                type="checkbox"
                checked={feedbackPings}
                onChange={(e) => setFeedbackPings(e.target.checked)}
                className="w-4 h-4 accent-[#6F00FF] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
