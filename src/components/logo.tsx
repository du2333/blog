import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Proxy Archive Logo"
    >
      {/* 
        Simple, sharp lightning bolt (Zap) 
        A classic symbol of energy and speed, fitting the ZZZ aesthetic perfectly.
      */}
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
};
