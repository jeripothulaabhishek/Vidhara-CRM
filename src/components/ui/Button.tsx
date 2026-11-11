import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "lavender" | "destructive" | "glass";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary:
        "bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white hover:opacity-95 shadow-md shadow-[#6F00FF]/25 border-none active:scale-[0.98]",
      secondary:
        "bg-white hover:bg-[#FAF7FC] text-[#241A33] border border-[#F0E6F3] shadow-sm hover:border-[#E9B3FB]/60 active:scale-[0.98]",
      outline:
        "bg-transparent border border-[#F0E6F3] text-[#241A33] hover:bg-[#FAF7FC] hover:border-[#E9B3FB] active:scale-[0.98]",
      ghost:
        "bg-transparent text-[#837C8D] hover:text-[#241A33] hover:bg-[#FAF7FC] active:scale-[0.98]",
      lavender:
        "bg-[#E9B3FB]/25 text-[#3B0270] hover:bg-[#E9B3FB]/40 border border-[#E9B3FB]/50 active:scale-[0.98]",
      destructive:
        "bg-[#D84B66] text-white hover:bg-[#D84B66]/90 shadow-sm shadow-[#D84B66]/20 active:scale-[0.98]",
      glass:
        "bg-white/80 backdrop-blur-md border border-[#F0E6F3] text-[#241A33] hover:bg-white shadow-sm hover:border-[#E9B3FB] active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
      md: "h-10 px-4 text-sm rounded-2xl gap-2",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5 font-medium",
      icon: "h-10 w-10 rounded-2xl p-0 flex items-center justify-center",
      "icon-sm": "h-8 w-8 rounded-xl p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F00FF]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

