import { ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface DropdownOption {
	label: string;
	value: string;
}

interface DropdownMenuProps {
	value: string;
	options: DropdownOption[];
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
				className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
			>
				<span>{selectedOption.label}</span>
				<ChevronDown
					size={12}
					className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-2 w-48 bg-popover/95 backdrop-blur-xl border border-border rounded-sm shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200 max-h-64 overflow-y-auto custom-scrollbar">
					{options.map((option) => (
						<button
							key={option.value}
							onClick={() => {
								onChange(option.value);
								setIsOpen(false);
							}}
							className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
								value === option.value
									? "text-foreground bg-accent"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
