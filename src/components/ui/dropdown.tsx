import { useEffect, useRef, useState } from "react";
import type React from "react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<DropdownItem>;
  className?: string;
  align?: "left" | "right";
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = "",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-48 bg-popover/95 backdrop-blur-xl border border-border rounded-sm shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-3",
                item.danger
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                item.className,
              )}
            >
              {item.icon && <span className="opacity-70">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
