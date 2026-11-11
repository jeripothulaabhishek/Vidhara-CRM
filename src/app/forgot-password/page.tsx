"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/app/actions/portal";
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await requestPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || "Password reset link sent to your email.");
      setEmail("");
    } else {
      setErrorMessage(res.error || "Failed to dispatch reset email.");
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
            Reset Password
          </h1>
          <p className="text-xs text-[#837C8D] mt-1">
            Enter your email to receive a secure recovery link
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Account Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 bg-gradient-to-r from-[#6F00FF] to-[#3B0270]"
            isLoading={isLoading}
          >
            <span>Send Recovery Email</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F0E6F3] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F00FF] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
