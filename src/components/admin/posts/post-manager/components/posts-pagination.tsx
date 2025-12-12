import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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
  totalPages: number
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
    <div className="flex items-center justify-between border-t border-zzz-gray pt-6 mt-6">
      <div className="text-xs font-mono text-gray-500">
        SHOWING {startItem} - {endItem} OF {totalItems} RECORDS
      </div>

      <div className="flex gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 flex items-center justify-center border border-zzz-gray text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber === "..." ? (
              <div className="h-9 w-9 flex items-center justify-center text-gray-600 font-mono text-xs">
                <MoreHorizontal size={14} />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`h-9 w-9 cursor-pointer flex items-center justify-center font-bold font-mono text-xs border transition-colors ${
                  currentPage === pageNumber
                    ? "bg-zzz-lime text-black border-zzz-lime"
                    : "bg-black text-gray-400 border-zzz-gray hover:text-white hover:border-white"
                }`}
              >
                {pageNumber}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 flex items-center justify-center border border-zzz-gray text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
