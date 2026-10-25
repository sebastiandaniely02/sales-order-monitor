import { useEffect, useState } from 'react';
import { getMeta, getOrders } from './api/salesOrders';
import useDebounce from './hooks/useDebounce';
import Dashboard from './components/Dashboard';
import Filters from './components/Filters';
import OrderTable from './components/OrderTable';
import Pagination from './components/Pagination';
import StateMessage from './components/StateMessage';
import './App.css';

const PAGE_SIZE = 25;
const DEFAULT_SORT = { field: 'CreatedDateTime1', order: 'desc' }; // newest first

export default function App() {
  // Dropdown options (from /meta)
  const [meta, setMeta] = useState({ statuses: [], sites: [] });

  // Filters, sorting and paging (what we send to the API)
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [reloadKey, setReloadKey] = useState(0); // bump to retry

  const debouncedSearch = useDebounce(search.trim(), 400);

  // A unique "fingerprint" of the current request
  const requestKey = JSON.stringify({ page, debouncedSearch, site, status, sort, reloadKey });

  // The last response we received, tagged with the request it belongs to
  const [response, setResponse] = useState({ key: null, data: null, error: '' });

  // Derived state: loading = the response we have is not for the current request yet
  const loading = response.key !== requestKey;
  const result = response.data;
  const error = loading ? '' : response.error;

  // 1) Load dropdown options once when the page opens
  useEffect(() => {
    const controller = new AbortController();
    getMeta(controller.signal)
      .then((data) =>
        setMeta({
          statuses: data.facets?.statuses ?? [],
          sites: data.facets?.sites ?? [],
        }),
      )
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load filters', err);
      });
    return () => controller.abort();
  }, []);

  // 2) Load orders whenever page, filters or sort change
  useEffect(() => {
    const controller = new AbortController();

    getOrders(
      {
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch,
        site,
        status,
        sort: sort.field,
        order: sort.order,
      },
      controller.signal,
    )
      .then((data) => {
        setResponse({ key: requestKey, data, error: '' });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // an older request was cancelled
        // Keep the previous data so the dashboard doesn't disappear on error
        setResponse((prev) => ({ key: requestKey, data: prev.data, error: err.message }));
      });

    // Cancel this request if the user changes something before it finishes
    return () => controller.abort();
  }, [page, debouncedSearch, site, status, sort, reloadKey, requestKey]);

  // Any filter change goes back to page 1
  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }
  function handleSite(value) {
    setSite(value);
    setPage(1);
  }
  function handleStatus(value) {
    setStatus(value);
    setPage(1);
  }
  function handleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { field, order: 'asc' },
    );
    setPage(1);
  }
  function clearFilters() {
    setSearch('');
    setSite('');
    setStatus('');
    setPage(1);
  }

  const hasFilters = Boolean(search || site || status);
  const orders = result?.data ?? [];

  // Decide which state to show in the results area
  let content;
  if (error) {
    content = (
      <StateMessage
        type="error"
        title="Could not load sales orders"
        message={error}
        actionLabel="Retry"
        onAction={() => setReloadKey((k) => k + 1)}
      />
    );
  } else if (loading && !result) {
    content = <StateMessage type="loading" title="Loading sales orders…" />;
  } else if (orders.length === 0) {
    content = (
      <StateMessage
        type="empty"
        title="No orders match your filters"
        message="Try a different search term, site or status."
        actionLabel={hasFilters ? 'Clear filters' : undefined}
        onAction={clearFilters}
      />
    );
  } else {
    content = (
      <>
        <OrderTable orders={orders} sort={sort} onSort={handleSort} loading={loading} />
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          onPage={setPage}
          disabled={loading}
        />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sales Order Monitoring</h1>
        <p className="muted">Sales orders across all branches · fictional assessment data</p>
      </header>

      <main>
        <Dashboard summary={result?.summary} />

        <section className="panel" aria-label="Sales orders">
          <div className="panel-head">
            <h2>Orders</h2>
            {result && !error && (
              <span className="muted">
                {result.total} of {result.summary?.total_orders ?? result.total} orders
                {loading && ' · updating…'}
              </span>
            )}
          </div>

          <Filters
            search={search}
            onSearch={handleSearch}
            site={site}
            onSite={handleSite}
            status={status}
            onStatus={handleStatus}
            sites={meta.sites}
            statuses={meta.statuses}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />

          {content}
        </section>
      </main>
    </div>
  );
}