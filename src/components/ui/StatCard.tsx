import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon,
  iconBg = "bg-[#FAF7FC] text-[#6F00FF]",
  badge,
  onClick,
  className,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm hover:shadow-md hover:border-[#E9B3FB]/80 transition-all duration-300 group",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-[#837C8D] uppercase tracking-wider">{title}</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[#241A33] tracking-tight group-hover:text-[#6F00FF] transition-colors">
              {value}
            </h3>
            {change && (
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                  isPositive
                    ? "bg-[#16865C]/10 text-[#16865C]"
                    : "bg-[#D84B66]/10 text-[#D84B66]"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />
                )}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#837C8D] mt-1 line-clamp-1">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200",
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-[#F0E6F3] flex items-center justify-between text-xs text-[#837C8D]">
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
}

