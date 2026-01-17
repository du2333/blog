import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type React from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownMenuProps {
  value: string;
  options: Array<DropdownOption>;
  onChange: (value: string) => void;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  value,
  options,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

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
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-popover border border-border/30 z-50 py-1 animate-in fade-in duration-200 max-h-64 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[9px] font-mono uppercase tracking-widest transition-colors ${
                value === option.value
                  ? "text-foreground bg-accent/50"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
