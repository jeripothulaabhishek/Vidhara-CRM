import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-[#837C8D] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-10 px-3.5 bg-white border border-[#F0E6F3] rounded-2xl text-sm text-[#241A33] placeholder:text-[#837C8D] transition-all duration-200 outline-none focus:border-[#6F00FF] focus:ring-2 focus:ring-[#6F00FF]/15 disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

