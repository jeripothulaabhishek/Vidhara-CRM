"use client";

import React from "react";
import { useTaskContext } from "@/context/TaskContext";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismissToast } = useTaskContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info" || !toast.type;

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-popover shadow-xl border animate-fade-in transition-all",
              isSuccess && "border-[#16865C]/30 bg-white/95",
              isError && "border-[#D84B66]/30 bg-white/95",
              isWarning && "border-[#D99516]/30 bg-white/95",
              isInfo && "border-[#E9B3FB] bg-white/95"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#16865C]" />}
              {isError && <XCircle className="w-5 h-5 text-[#D84B66]" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-[#D99516]" />}
              {isInfo && <Info className="w-5 h-5 text-[#6F00FF]" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#241A33]">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-[#837C8D] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#837C8D] hover:text-[#241A33] p-1 rounded-lg hover:bg-[#FAF7FC] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

