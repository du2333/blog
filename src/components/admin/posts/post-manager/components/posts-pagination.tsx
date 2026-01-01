import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

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
): Array<number | "..."> {
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
	if (totalPages <= 1)
		return null;

	const pageNumbers = getPageNumbers(currentPage, totalPages);
	const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
	const endItem = Math.min(startItem + currentPageItemCount - 1, totalItems);

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-border mt-12">
			<div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">
				Displaying
				{" "}
				{startItem}
				{" "}
				—
				{" "}
				{endItem}
				{" "}
				of
				{" "}
				{totalItems}
			</div>

			<div className="flex items-center gap-1">
				{/* Previous Button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-10 w-10 text-muted-foreground disabled:opacity-10 hover:text-foreground transition-colors rounded-sm"
				>
					<ChevronLeft size={18} strokeWidth={1.5} />
				</Button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1 px-4">
					{pageNumbers.map((pageNumber, index) => (
						<React.Fragment key={index}>
							{pageNumber === "..."
								? (
										<div className="w-8 text-center text-[10px] text-muted-foreground tracking-tighter">
											...
										</div>
									)
								: (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onPageChange(pageNumber)}
											className={`h-8 min-w-[32px] px-2 flex items-center justify-center text-[11px] font-mono transition-all duration-300 rounded-none ${
												currentPage === pageNumber
													? "text-foreground font-bold border-b-2 border-foreground bg-transparent hover:bg-transparent"
													: "text-muted-foreground hover:text-foreground border-b-2 border-transparent bg-transparent hover:bg-transparent"
											}`}
										>
											{pageNumber.toString().padStart(2, "0")}
										</Button>
									)}
						</React.Fragment>
					))}
				</div>

				{/* Next Button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-10 w-10 text-muted-foreground disabled:opacity-10 hover:text-foreground transition-colors rounded-sm"
				>
					<ChevronRight size={18} strokeWidth={1.5} />
				</Button>
			</div>
		</div>
	);
}
