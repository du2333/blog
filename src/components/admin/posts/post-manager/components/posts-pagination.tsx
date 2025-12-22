import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PostsPaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	currentPageItemCount: number;
	onPageChange: (page: number) => void;
}

/** Generate smart page numbers with ellipsis */
function getPageNumbers(
	currentPage: number,
	totalPages: number,
): (number | "...")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	if (currentPage <= 4) {
		return [1, 2, 3, 4, 5, "...", totalPages];
	}

	if (currentPage >= totalPages - 3) {
		return [
			1,
			"...",
			totalPages - 4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}

	return [
		1,
		"...",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"...",
		totalPages,
	];
}

export function PostsPagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	currentPageItemCount,
	onPageChange,
}: PostsPaginationProps) {
	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers(currentPage, totalPages);
	const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
	const endItem = Math.min(startItem + currentPageItemCount - 1, totalItems);

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-zinc-100 dark:border-white/5 mt-12">
			<div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
				Displaying {startItem} — {endItem} of {totalItems}
			</div>

			<div className="flex items-center gap-1">
				{/* Previous Button */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-10 w-10 flex items-center justify-center text-zinc-400 disabled:opacity-10 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
				>
					<ChevronLeft size={18} strokeWidth={1.5} />
				</button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1 px-4">
					{pageNumbers.map((pageNumber, index) => (
						<React.Fragment key={index}>
							{pageNumber === "..." ? (
								<div className="w-8 text-center text-[10px] text-zinc-300 dark:text-zinc-700 tracking-tighter">
									...
								</div>
							) : (
								<button
									onClick={() => onPageChange(pageNumber)}
									className={`h-8 min-w-[32px] px-2 flex items-center justify-center text-[11px] font-mono transition-all duration-300 ${
										currentPage === pageNumber
											? "text-zinc-950 dark:text-zinc-50 font-bold border-b border-zinc-900 dark:border-zinc-100"
											: "text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 border-b border-transparent"
									}`}
								>
									{pageNumber.toString().padStart(2, "0")}
								</button>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Next Button */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-10 w-10 flex items-center justify-center text-zinc-400 disabled:opacity-10 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
				>
					<ChevronRight size={18} strokeWidth={1.5} />
				</button>
			</div>
		</div>
	);
}
