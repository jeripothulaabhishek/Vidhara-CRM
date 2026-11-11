"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function InviteAcceptancePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      router.push("/portal/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to set password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#F0E6F3] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#E9B3FB]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6F00FF] to-[#3B0270] flex items-center justify-center text-white mx-auto shadow-md shadow-[#6F00FF]/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#241A33] tracking-tight">
            Accept Studio Invitation
          </h1>
          <p className="text-xs text-[#837C8D] mt-1">
            Create your password to activate your Vidhara Dashboard workspace
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 text-xs text-[#D84B66] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Create Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Confirm Password
            </label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 bg-gradient-to-r from-[#6F00FF] to-[#3B0270]"
            isLoading={isLoading}
          >
            <span>Activate Account & Enter Portal</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
