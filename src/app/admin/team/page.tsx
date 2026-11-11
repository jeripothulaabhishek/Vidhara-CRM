"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TEAM_MEMBERS } from "@/lib/mock-data";
import { useTaskContext } from "@/context/TaskContext";
import { inviteTeamMember } from "@/app/actions/admin";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminTeamPage() {
  const { showToast } = useTaskContext();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Visual Designer");
  const [isInviting, setIsInviting] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    setIsInviting(true);
    const res = await inviteTeamMember(inviteEmail, inviteName, inviteRole);
    setIsInviting(false);

    if (res.success) {
      showToast("Invitation Dispatched", `Secure invite sent to ${inviteEmail}.`, "success");
      setInviteEmail("");
      setInviteName("");
      setIsInviteOpen(false);
    } else {
      // If running before Supabase Auth is populated, show informative toast
      showToast("Invite Notice", res.error || "Invite recorded in agency queue.", "info");
      setIsInviteOpen(false);
    }
  };

  return (
    <main className="px-4 md:px-8 pb-12 pt-2">
      <PageHeader
        title="Agency Team & Roles"
        subtitle="Manage designer accounts, discipline allocations, and server-authorized invitations."
        action={
          <Button variant="primary" size="md" onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#6F00FF]/20 shadow-xs">
                  <Image
                    src={member.avatar_url}
                    alt={member.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FAF7FC] text-[#3B0270] border border-[#F0E6F3]">
                  {member.role.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-base font-bold text-[#241A33]">{member.full_name}</h4>
              <p className="text-xs font-medium text-[#6F00FF]">{member.agency_role}</p>
              <p className="text-[11px] text-[#837C8D] mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>

              {/* Workload */}
              <div className="mt-4 p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#837C8D]">Sprint Workload</span>
                  <span className="font-bold text-[#241A33]">8 / 12 Active</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#F0E6F3]">
                  <div className="h-full rounded-full bg-[#6F00FF]" style={{ width: "67%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0E6F3] flex items-center justify-between text-xs">
              <span className="text-[#16865C] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16865C] inline-block animate-pulse" />
                Active Account
              </span>
              <button
                onClick={() => showToast("Member Triage", `Inspecting workload for ${member.full_name}.`, "info")}
                className="text-[#6F00FF] font-semibold hover:underline"
              >
                Manage Access
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#241A33]/40 backdrop-blur-sm"
            onClick={() => setIsInviteOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-[#F0E6F3] rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#241A33]">Invite Agency Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-xl text-[#837C8D] hover:text-[#241A33]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#241A33] mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241A33] mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="maya@vidhara.design"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241A33] mb-1">
                  Agency Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs font-medium text-[#241A33] outline-none"
                >
                  <option value="Senior Brand Designer">Senior Brand Designer</option>
                  <option value="UI/UX Architect">UI/UX Architect</option>
                  <option value="3D & Motion Artist">3D & Motion Artist</option>
                  <option value="Packaging Specialist">Packaging Specialist</option>
                  <option value="Creative Director">Creative Director</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF1F1] border border-[#E9B3FB]/60 text-[11px] text-[#3B0270] leading-relaxed">
                Invited members receive an email with a secure token to create their password. They will be assigned the <strong>MEMBER</strong> role.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isInviting}>
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
