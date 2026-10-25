export default function Filters({
  search,
  onSearch,
  site,
  onSite,
  status,
  onStatus,
  sites,
  statuses,
  hasFilters,
  onClear,
}) {
  return (
    <div className="filters">
      <label className="field grow">
        <span>Search</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Order no, customer, account, PO ref, sales taker"
        />
      </label>

      <label className="field">
        <span>Branch / site</span>
        <select value={site} onChange={(e) => onSite(e.target.value)}>
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(e) => onStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button type="button" className="btn-link" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}