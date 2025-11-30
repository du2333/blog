import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or default to today
  const initialDate = value ? new Date(value) : new Date();
  // State for the currently viewed month/year in the calendar
  const [viewDate, setViewDate] = useState(initialDate);

  const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1
    );
    setViewDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const dateString = `${year}-${month}-${dayStr}`;

    onChange(dateString);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    // Use UTC methods to avoid timezone shift issues on simple date strings
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    // Parse the value string manually to avoid timezone offset
    const [vYear, vMonth, vDay] = value.split("-").map(Number);

    return vYear === currentYear && vMonth - 1 === currentMonth && vDay === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const slots = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      slots.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const selected = isSelected(i);
      const today = isToday(i);

      slots.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`
            w-8 h-8 text-xs font-mono font-bold flex items-center justify-center transition-colors relative group
            ${
              selected
                ? "bg-zzz-lime text-black"
                : "text-gray-400 hover:text-white hover:bg-zzz-gray"
            }
            ${today && !selected ? "border border-zzz-lime text-zzz-lime" : ""}
          `}
        >
          {i}
          {/* Decorative corner for hover */}
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-zzz-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      );
    }

    return slots;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
            relative w-full bg-black border text-white text-xs font-mono pl-9 pr-3 py-3 cursor-pointer select-none transition-colors group
            ${isOpen ? "border-zzz-lime" : "border-zzz-gray hover:border-white"}
        `}
      >
        <CalendarIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            isOpen ? "text-zzz-lime" : "text-gray-500 group-hover:text-white"
          }`}
          size={14}
        />
        {value || "SELECT_DATE"}
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 bg-zzz-black border-2 border-zzz-lime shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-4 w-64 animate-in fade-in zoom-in-95 duration-200 clip-corner-bl">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zzz-lime"></div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-zzz-gray pb-2">
            <button
              onClick={() => changeMonth(-1)}
              className="text-gray-500 hover:text-zzz-cyan transition-colors p-1"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs font-bold font-sans uppercase tracking-widest text-white">
              {viewDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="text-gray-500 hover:text-zzz-cyan transition-colors p-1"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Grid Header (Days) */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="w-8 text-center text-[10px] font-mono font-bold text-zzz-gray"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-dashed border-zzz-gray text-[9px] font-mono text-gray-600 text-center uppercase tracking-wider">
            System_Time:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
