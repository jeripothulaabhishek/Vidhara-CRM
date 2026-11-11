"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";

const FILTER_PILLS = ["All", "Branding", "UI/UX", "3D & Motion", "Packaging", "Pitch Deck"];

export function SearchInput({
  className,
  placeholder = "Search tasks, clients, deliverables, briefs...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const { searchQuery, setSearchQuery, categoryFilter, setCategoryFilter } = useTaskContext();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center bg-white/90 backdrop-blur-md border rounded-2xl px-3.5 py-1.5 transition-all duration-200 shadow-sm",
        isFocused
          ? "border-[#6F00FF] ring-2 ring-[#6F00FF]/15 bg-white"
          : "border-[#F0E6F3] hover:border-[#E9B3FB]",
        className
      )}
    >
      <Search className="w-4 h-4 text-[#837C8D] shrink-0 mr-2.5" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-xs md:text-sm text-[#241A33] placeholder:text-[#837C8D]"
      />

      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="p-1 text-[#837C8D] hover:text-[#241A33] rounded-lg transition-colors mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Filter Category selector pill */}
      <div className="hidden lg:flex items-center gap-1.5 pl-2.5 border-l border-[#F0E6F3] shrink-0">
        <span className="text-[11px] text-[#837C8D] font-medium mr-1">In:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-transparent text-[#241A33] font-medium border-none outline-none cursor-pointer hover:text-[#6F00FF]"
        >
          <option value="all">All Disciplines</option>
          <option value="Branding & Identity">Branding</option>
          <option value="UI/UX Design">UI/UX</option>
          <option value="3D & Motion">3D & Motion</option>
          <option value="Packaging Design">Packaging</option>
          <option value="Pitch Deck & Presentation">Pitch Decks</option>
          <option value="Social Media Kit">Social Kits</option>
        </select>
      </div>
    </div>
  );
}

