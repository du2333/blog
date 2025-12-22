import { ArrowUpDown, ChevronDown, Filter, Search, Tag, X } from "lucide-react";
import { useState } from "react";

import {
	CATEGORY_FILTERS,
	type CategoryFilter,
	type SortDirection,
	STATUS_FILTERS,
	type StatusFilter,
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

	const hasActiveFilters =
		category !== "ALL" ||
		status !== "ALL" ||
		sortDir !== "DESC" ||
		searchTerm !== "";

	return (
		<div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center">
			{/* Search */}
			<div className="relative w-full lg:max-w-md">
				<Search
					className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700"
					size={16}
					strokeWidth={1.5}
				/>
				<input
					type="text"
					placeholder="检索文章标题..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full bg-transparent border-b border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-sm font-serif italic pl-8 pr-8 py-3 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
				/>
				{searchTerm && (
					<button
						onClick={() => onSearchChange("")}
						className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
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
							)
						}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
									category !== "ALL"
										? "text-zinc-950 dark:text-zinc-50"
										: "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
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
						<div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-white/10 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{CATEGORY_FILTERS.map((cat) => (
								<button
									key={cat}
									onClick={() => {
										onCategoryChange(cat);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${
										category === cat
											? "text-zinc-950 dark:text-zinc-50 font-bold bg-zinc-50 dark:bg-white/5"
											: "text-zinc-400"
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
							setActiveDropdown(activeDropdown === "STATUS" ? null : "STATUS")
						}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
									status !== "ALL"
										? "text-zinc-950 dark:text-zinc-50"
										: "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
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
						<div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-white/10 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{STATUS_FILTERS.map((s) => (
								<button
									key={s}
									onClick={() => {
										onStatusChange(s);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${
										status === s
											? "text-zinc-950 dark:text-zinc-50 font-bold bg-zinc-50 dark:bg-white/5"
											: "text-zinc-400"
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
							setActiveDropdown(activeDropdown === "SORT" ? null : "SORT")
						}
						className={`
                h-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-all group
                ${
									sortDir !== "DESC"
										? "text-zinc-950 dark:text-zinc-50"
										: "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
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
						<div className="absolute top-full right-0 lg:left-0 mt-2 w-48 bg-white dark:bg-[#0c0c0c] border border-zinc-100 dark:border-white/10 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-sm overflow-hidden">
							{[
								{ label: "最新发布", dir: "DESC" as SortDirection },
								{ label: "最早发布", dir: "ASC" as SortDirection },
							].map((opt) => (
								<button
									key={opt.label}
									onClick={() => {
										onSortChange(opt.dir);
										setActiveDropdown(null);
									}}
									className={`w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${
										sortDir === opt.dir
											? "text-zinc-950 dark:text-zinc-50 font-bold bg-zinc-50 dark:bg-white/5"
											: "text-zinc-400"
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
