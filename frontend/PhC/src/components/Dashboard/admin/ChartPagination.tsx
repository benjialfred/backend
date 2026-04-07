import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChartPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const ChartPagination = ({ currentPage, totalPages, onPageChange }: ChartPaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                aria-label="Previous Page"
            >
                <ChevronLeft size={14} className="text-gray-300" />
            </button>

            <span className="text-[10px] text-gray-400 font-mono px-1">
                {currentPage + 1} / {totalPages}
            </span>

            <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                aria-label="Next Page"
            >
                <ChevronRight size={14} className="text-gray-300" />
            </button>
        </div>
    );
};

export default ChartPagination;
