import React from "react";
import { cn } from "@/lib/utils";

interface TechButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const TechButton: React.FC<TechButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "relative font-sans uppercase font-bold tracking-wider transition-all duration-200 overflow-hidden group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1 text-[10px]",
    md: "px-6 py-2 text-xs md:text-sm",
    lg: "px-8 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-zzz-lime text-black hover:bg-white border-2 border-transparent hover:border-zzz-lime clip-corner-tr",
    secondary:
      "bg-transparent text-zzz-white border-2 border-zzz-gray hover:border-zzz-cyan hover:text-zzz-cyan clip-corner-bl",
    danger:
      "bg-zzz-orange text-black hover:bg-red-600 hover:text-white clip-corner-tr",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        {icon}
        <span>{children}</span>
      </div>
      {/* Decorative scanline on hover */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
    </button>
  );
};

export default TechButton;
