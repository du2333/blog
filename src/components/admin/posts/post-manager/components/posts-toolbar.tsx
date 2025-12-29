import type { CategoryFilter, SortDirection, StatusFilter } from "../types";
import { ArrowUpDown, ChevronDown, Filter, Search, Tag, X } from "lucide-react";

import { useState } from "react";
import {
	CATEGORY_FILTERS,

	STATUS_FILTERS,

} from "../types";

type DropdownType = "CATEGORY" | "STATUS" | "SORT" | null;

interface PostsToolbarProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	category: CategoryFilter;
	onCategoryChange: (category: CategoryFilter) => void;
	status: StatusFilter;
	onStatusChange: (status: StatusFilter) => void;
	sortDir: SortDirection;
	onSortChange: (dir: SortDirection) => void;
	onResetFilters: () => void;
}

export function PostsToolbar({
	searchTerm,
	onSearchChange,
	category,
	onCategoryChange,
	status,
	onStatusChange,
	sortDir,
	onSortChange,
	onResetFilters,
}: PostsToolbarProps) {
	const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

	const hasActiveFilters
		= category !== "ALL"
			|| status !== "ALL"
			|| sortDir !== "DESC"
			|| searchTerm !== "";

	return (
		<div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
			{/* Search */}
			<div className="relative w-full lg:max-w-md">
				<Search
					className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground"
					size={16}
					strokeWidth={1.5}
				/>
				<input
					type="text"
					placeholder="检索文章标题..."
					value={searchTerm}
					onChange={e => onSearchChange(e.target.value)}
					className="w-full bg-transparent border-b border-border text-sm font-serif italic pl-8 pr-8 py-3 focus:border-foreground focus:outline-none transition-all placeholder:text-muted-foreground"
				/>
				{searchTerm && (
					<button
						onClick={() => onSearchChange("")}
						className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X size={14} />
					</button>
				)}
			</div>

			{/* Filters Container */}
			<div className="flex flex-wrap gap-4 w-full lg:w-auto">
				{/* 1. Category Filter */}
				<div className="relative">
					<button
						onClick={() =>
							setActiveDropdown(
								activeDropdown === "CATEGORY" ? null : "CATEGORY",
							)}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
		category !== "ALL"
			? ""
			: "text-muted-foreground hover:text-foreground"
		}
            `}
					>
						<Tag size={12} strokeWidth={1.5} />
						{category === "ALL" ? "所有分类" : category}
						<ChevronDown
							size={12}
							className={`transition-transform duration-500 opacity-40 ${
								activeDropdown === "CATEGORY" ? "rotate-180" : ""
							}`}
						/>
					</button>
					{activeDropdown === "CATEGORY" && (
						<div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{CATEGORY_FILTERS.map(cat => (
								<button
									key={cat}
									onClick={() => {
										onCategoryChange(cat);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-colors ${
										category === cat
											? "font-bold bg-accent"
											: "text-muted-foreground"
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					)}
				</div>

				{/* 2. Status Filter */}
				<div className="relative">
					<button
						onClick={() =>
							setActiveDropdown(activeDropdown === "STATUS" ? null : "STATUS")}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
		status !== "ALL"
			? ""
			: "text-muted-foreground hover:text-foreground"
		}
            `}
					>
						<Filter size={12} strokeWidth={1.5} />
						{status === "ALL" ? "所有状态" : status}
						<ChevronDown
							size={12}
							className={`transition-transform duration-500 opacity-40 ${
								activeDropdown === "STATUS" ? "rotate-180" : ""
							}`}
						/>
					</button>
					{activeDropdown === "STATUS" && (
						<div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{STATUS_FILTERS.map(s => (
								<button
									key={s}
									onClick={() => {
										onStatusChange(s);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-colors ${
										status === s
											? "font-bold bg-accent"
											: "text-muted-foreground"
									}`}
								>
									{s}
								</button>
							))}
						</div>
					)}
				</div>

				{/* 3. Sort Dropdown */}
				<div className="relative">
					<button
						onClick={() =>
							setActiveDropdown(activeDropdown === "SORT" ? null : "SORT")}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
		sortDir !== "DESC"
			? ""
			: "text-muted-foreground hover:text-foreground"
		}
            `}
					>
						<ArrowUpDown size={12} strokeWidth={1.5} />
						{sortDir === "DESC" ? "最新发布" : "最早发布"}
						<ChevronDown
							size={12}
							className={`transition-transform duration-500 opacity-40 ${
								activeDropdown === "SORT" ? "rotate-180" : ""
							}`}
						/>
					</button>
					{activeDropdown === "SORT" && (
						<div className="absolute top-full right-0 lg:left-0 mt-2 w-48 bg-popover border border-border shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{[
								{ label: "最新发布", dir: "DESC" as SortDirection },
								{ label: "最早发布", dir: "ASC" as SortDirection },
							].map(opt => (
								<button
									key={opt.label}
									onClick={() => {
										onSortChange(opt.dir);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-colors ${
										sortDir === opt.dir
											? "font-bold bg-accent"
											: "text-muted-foreground"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Reset Button */}
				{hasActiveFilters && (
					<button
						onClick={onResetFilters}
						className="h-10 flex items-center gap-2 px-4 text-[10px] uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors animate-in fade-in slide-in-from-left-2 duration-500"
						title="重置所有筛选"
					>
						<X size={14} />
						<span>重置</span>
					</button>
				)}
			</div>
		</div>
	);
}
