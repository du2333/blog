import { ChevronLeft, ChevronRight } from "lucide-react";
import TechButton from "@/components/ui/tech-button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  goToPage,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-16 font-mono select-none">
      <TechButton
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
        className="w-12 sm:w-32 px-0 sm:px-6"
      >
        <div className="flex items-center justify-center gap-2">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">PREV</span>
        </div>
      </TechButton>

      <div className="bg-zzz-black border-2 border-zzz-gray px-6 py-2 text-zzz-lime font-bold text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        PAGE {currentPage.toString().padStart(2, "0")}{" "}
        <span className="text-gray-600">/</span>{" "}
        {totalPages.toString().padStart(2, "0")}
      </div>

      <TechButton
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
        className="w-12 sm:w-32 px-0 sm:px-6"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight size={16} />
        </div>
      </TechButton>
    </div>
  );
}
