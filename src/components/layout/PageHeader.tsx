import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#241A33]">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-[#837C8D] mt-1">{subtitle}</p>
          )}
        </div>

        {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
      </div>

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

