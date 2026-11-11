"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { checkIfUsersExist, setupInitialAdmin } from "@/app/actions/admin";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "init">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agencyRole, setAgencyRole] = useState("Creative Director & Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUsers() {
      try {
        const res = await checkIfUsersExist();
        if (res && res.exists === false) {
          setMode("init");
        }
      } catch {
        // Fallback to login mode
      }
    }
    checkUsers();
  }, []);

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

  const handleInitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await setupInitialAdmin({
        email,
        password,
        fullName,
        agencyRole,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to initialize administrator account.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Admin account created! Signing you in...");

      // Automatically sign in with the new credentials
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setErrorMessage(
          `Account initialized, but auto-sign in failed: ${signInErr.message}. Please sign in manually.`
        );
        setMode("login");
        setIsLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during admin setup.");
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

        {/* Mode Selector */}
        <div className="flex rounded-2xl bg-[#FAF7FC] p-1 border border-[#F0E6F3] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-[#241A33] shadow-xs"
                : "text-[#837C8D] hover:text-[#241A33]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("init");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "init"
                ? "bg-white text-[#6F00FF] shadow-xs"
                : "text-[#837C8D] hover:text-[#241A33]"
            }`}
          >
            Setup Super Admin
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 text-xs text-[#D84B66] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#16865C]/10 border border-[#16865C]/20 text-xs text-[#16865C] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === "login" ? (
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
        ) : (
          <form onSubmit={handleInitAdmin} className="space-y-3.5">
            <div className="p-2.5 rounded-xl bg-[#FAF1FD] border border-[#E9B3FB]/40 text-[11px] text-[#3B0270] flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0 text-[#6F00FF]" />
              <span>
                Initialize your master studio owner account. Seeds agency records into Supabase.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1">
                Full Name
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abhishek Jeripothula"
                icon={<User className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1">
                Admin Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vidhara.design"
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1">
                Secure Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1">
                Agency Role
              </label>
              <Input
                type="text"
                value={agencyRole}
                onChange={(e) => setAgencyRole(e.target.value)}
                placeholder="Creative Director & Admin"
                icon={<Sparkles className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              <span>Initialize Master Admin</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-[#F0E6F3] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#837C8D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16865C]" />
            <span>Private Workspace • Row Level Security Active</span>
          </div>
          <p className="text-[10px] text-[#837C8D]/80 mt-1">
            Connected to Supabase PostgreSQL (Vidhara-CRM)
          </p>
        </div>
      </div>
    </div>
  );
}


