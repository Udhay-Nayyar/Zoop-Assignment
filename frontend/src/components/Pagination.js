export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <nav className="pagination" aria-label="Agent list pages">
      <p>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong></p>
      <div className="pagination-controls">
        <button className="button button-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong></span>
        <button className="button button-secondary" disabled={totalPages === 0 || page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
