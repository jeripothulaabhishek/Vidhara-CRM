"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Query user's role to route to admin or member view
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Could not connect to Supabase. Please ensure your .env.local is configured."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#F0E6F3] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#E9B3FB]/40 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6F00FF] to-[#3B0270] flex items-center justify-center text-white mx-auto shadow-md shadow-[#6F00FF]/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#241A33] tracking-tight">
            VIDHARA DASHBOARD
          </h1>
          <p className="text-xs text-[#837C8D] mt-1">
            Private Graphic Design Agency CRM
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 text-xs text-[#D84B66] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@vidhara.design"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#241A33]">
                Password
              </label>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>Sign In to Studio</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-[#F0E6F3] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#837C8D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16865C]" />
            <span>Private Workspace • Invitation Only</span>
          </div>
          <p className="text-[10px] text-[#837C8D]/80 mt-1">
            Public registration is disabled. Accounts are provisioned by agency administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
