"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Settings,
  Shield,
  Sparkles,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mock-data";
import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useTaskContext();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    showToast("Signed Out", "You have successfully signed out of Vidhara Dashboard.", "info");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 pl-2.5 pr-2 rounded-2xl bg-white border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all duration-200 shadow-sm"
      >
        <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-2 ring-[#6F00FF]/20 shrink-0">
          <Image
            src={CURRENT_USER.avatar_url}
            alt={CURRENT_USER.full_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-[#241A33] leading-none line-clamp-1">
            {CURRENT_USER.full_name}
          </p>
          <span className="text-[10px] text-[#837C8D] leading-none mt-1 inline-block">
            {CURRENT_USER.agency_role.split("&")[0]}
          </span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-[#837C8D] transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 rounded-3xl glass-popover border border-[#F0E6F3] shadow-2xl p-2 z-50 animate-fade-in">
          {/* Header inside popup */}
          <div className="p-3 border-b border-[#F0E6F3] mb-1">
            <p className="text-xs font-semibold text-[#241A33]">{CURRENT_USER.full_name}</p>
            <p className="text-[11px] text-[#837C8D] truncate">{CURRENT_USER.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6F00FF]/10 text-[#6F00FF]">
              <Shield className="w-3 h-3" />
              Agency Admin
            </div>
          </div>

          <div className="space-y-0.5 text-xs">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#241A33] hover:bg-[#FAF7FC] hover:text-[#6F00FF] transition-colors"
            >
              <User className="w-4 h-4 text-[#837C8D]" />
              Creative Profile
            </Link>

            <Link
              href="/team"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#241A33] hover:bg-[#FAF7FC] hover:text-[#6F00FF] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#837C8D]" />
              Agency Workspace & Team
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#241A33] hover:bg-[#FAF7FC] hover:text-[#6F00FF] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#837C8D]" />
              Account Settings
            </Link>

            <div className="pt-1 mt-1 border-t border-[#F0E6F3]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#D84B66] hover:bg-[#D84B66]/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

