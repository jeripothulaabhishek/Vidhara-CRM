import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", options ?? {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(timeStr: string) {
  // If time string is HH:mm:ss or HH:mm
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minute} ${ampm}`;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  "Branding & Identity": {
    bg: "bg-[#F7E5FC]",
    text: "text-[#3B0270]",
    border: "border-[#E9B3FB]",
    iconBg: "bg-[#6F00FF]/10 text-[#6F00FF]",
  },
  "UI/UX Design": {
    bg: "bg-[#EBF3FF]",
    text: "text-[#0F4C81]",
    border: "border-[#BFDBFE]",
    iconBg: "bg-[#2563EB]/10 text-[#2563EB]",
  },
  "3D & Motion": {
    bg: "bg-[#FFF0F5]",
    text: "text-[#9D174D]",
    border: "border-[#FBCFE8]",
    iconBg: "bg-[#DB2777]/10 text-[#DB2777]",
  },
  "Social Media Kit": {
    bg: "bg-[#FFF7ED]",
    text: "text-[#C2410C]",
    border: "border-[#FED7AA]",
    iconBg: "bg-[#EA580C]/10 text-[#EA580C]",
  },
  "Pitch Deck & Presentation": {
    bg: "bg-[#F0FDF4]",
    text: "text-[#166534]",
    border: "border-[#BBF7D0]",
    iconBg: "bg-[#16865C]/10 text-[#16865C]",
  },
  "Packaging Design": {
    bg: "bg-[#FEFCE8]",
    text: "text-[#854D0E]",
    border: "border-[#FEF08A]",
    iconBg: "bg-[#CA8A04]/10 text-[#CA8A04]",
  },
};

