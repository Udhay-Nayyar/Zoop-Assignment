import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <nav className="pagination" aria-label="Agent list pages">
      <p>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong></p>
      <div className="pagination-controls">
        <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} size="sm" variant="outline">
          <ChevronLeft aria-hidden="true" size={14} />
          Previous
        </Button>
        <span>Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong></span>
        <Button disabled={totalPages === 0 || page >= totalPages} onClick={() => onPageChange(page + 1)} size="sm" variant="outline">
          Next
          <ChevronRight aria-hidden="true" size={14} />
        </Button>
      </div>
    </nav>
  );
}
