import type React from "react";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
	const [viewDate, setViewDate] = useState(initialDate);

	const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current
				&& !containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
			1,
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
		if (!value)
			return false;
		const currentYear = viewDate.getFullYear();
		const currentMonth = viewDate.getMonth();
		const [vYear, vMonth, vDay] = value.split("-").map(Number);
		return vYear === currentYear && vMonth - 1 === currentMonth && vDay === day;
	};

	const isToday = (day: number) => {
		const today = new Date();
		return (
			today.getDate() === day
			&& today.getMonth() === viewDate.getMonth()
			&& today.getFullYear() === viewDate.getFullYear()
		);
	};

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(viewDate);
		const firstDay = getFirstDayOfMonth(viewDate);
		const slots = [];

		for (let i = 0; i < firstDay; i++) {
			slots.push(<div key={`empty-${i}`} className="w-9 h-9"></div>);
		}

		for (let i = 1; i <= daysInMonth; i++) {
			const selected = isSelected(i);
			const today = isToday(i);

			slots.push(
				<button
					key={i}
					onClick={() => handleDayClick(i)}
					className={`
            w-9 h-9 text-[11px] font-medium flex items-center justify-center transition-all duration-300 rounded-sm relative group
            ${
				selected
					? "bg-primary text-primary-foreground shadow-lg"
					: "text-muted-foreground hover:text-foreground hover:bg-accent"
			}
            ${today && !selected ? "text-foreground font-bold" : ""}
          `}
				>
					{i}
					{today && !selected && (
						<div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
					)}
				</button>,
			);
		}

		return slots;
	};

	return (
		<div className={`relative ${className}`} ref={containerRef}>
			<div
				onClick={() => setIsOpen(!isOpen)}
				className={`
            relative w-full bg-muted/30 text-foreground text-xs font-light pl-11 pr-4 py-4 cursor-pointer select-none transition-all rounded-sm group
            ${isOpen ? "ring-1 ring-primary shadow-sm" : "hover:bg-accent"}
        `}
			>
				<CalendarIcon
					className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
						isOpen
							? "text-foreground"
							: "text-muted-foreground group-hover:text-foreground"
					}`}
					size={16}
					strokeWidth={1.5}
				/>
				<span className={value ? "opacity-100" : "opacity-40"}>
					{value || "选择日期"}
				</span>
			</div>

			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-2 bg-popover border border-border shadow-2xl p-6 w-[320px] animate-in fade-in zoom-in-95 duration-300 rounded-sm">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h4 className="text-sm font-serif font-medium text-foreground tracking-tight">
							{viewDate.toLocaleString("zh-CN", {
								month: "long",
								year: "numeric",
							})}
						</h4>
						<div className="flex items-center gap-1">
							<button
								onClick={() => changeMonth(-1)}
								className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-sm"
							>
								<ChevronLeft size={18} strokeWidth={1.5} />
							</button>
							<button
								onClick={() => changeMonth(1)}
								className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-sm"
							>
								<ChevronRight size={18} strokeWidth={1.5} />
							</button>
						</div>
					</div>

					{/* Grid Header (Days) */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{daysOfWeek.map(d => (
							<div
								key={d}
								className="w-9 text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest"
							>
								{d}
							</div>
						))}
					</div>

					{/* Grid Body */}
					<div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
				</div>
			)}
		</div>
	);
};

export default DatePicker;
