export default function AgentFilters({
  state,
  searchInput,
  setSearchInput,
  updateUrl,
  filtersActive,
  clearFilters
}) {
  return (
    <section aria-label="Agent list filters" className="filter-card">
      <div className="filter-grid">
        <label className="control-group search-control">
          <span>Search agents</span>
          <input aria-label="Search agents" placeholder="Name, email, phone, area…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        </label>
        <label className="control-group"><span>Status</span>
          <select value={state.status} onChange={(event) => updateUrl({ status: event.target.value }, { resetPage: true })}>
            <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="control-group"><span>Service area</span>
          <input maxLength={120} placeholder="Any area" value={state.serviceArea} onChange={(event) => updateUrl({ serviceArea: event.target.value }, { resetPage: true })} />
        </label>
        <label className="control-group"><span>Sort by</span>
          <select value={`${state.sortBy}:${state.order}`} onChange={(event) => {
            const [sortBy, order] = event.target.value.split(":");
            updateUrl({ sortBy, order }, { resetPage: true });
          }}>
            <option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option>
            <option value="updatedAt:desc">Recently updated</option><option value="fullName:asc">Name A–Z</option>
            <option value="fullName:desc">Name Z–A</option>
          </select>
        </label>
        <label className="control-group rows-control"><span>Rows</span>
          <select value={state.limit} onChange={(event) => updateUrl({ limit: Number(event.target.value) }, { resetPage: true })}>
            <option value="10">10</option><option value="25">25</option><option value="50">50</option>
          </select>
        </label>
      </div>
      {filtersActive && <button className="text-button clear-filters" onClick={clearFilters} type="button">Clear filters</button>}
    </section>
  );
}
