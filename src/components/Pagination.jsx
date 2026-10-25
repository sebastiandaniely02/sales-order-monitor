export default function Pagination({ page, pageSize, total, totalPages, onPage }) {
  if (!total) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        Showing {from}–{to} of {total}
      </span>
      <div className="pager">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          ‹ Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
          Next ›
        </button>
      </div>
    </nav>
  );
}