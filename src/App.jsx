import { useEffect, useState } from 'react';
import { getMeta, getOrders } from './api/salesOrders';
import useDebounce from './hooks/useDebounce';
import Dashboard from './components/Dashboard';
import Filters from './components/Filters';
import OrderTable from './components/OrderTable';
import Pagination from './components/Pagination';
import './App.css';

const PAGE_SIZE = 25;
const DEFAULT_SORT = { field: 'CreatedDateTime1', order: 'desc' };

export default function App() {
  const [meta, setMeta] = useState({ statuses: [], sites: [] });
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  const debouncedSearch = useDebounce(search.trim(), 400);

  useEffect(() => {
    getMeta()
      .then((data) =>
        setMeta({
          statuses: data.facets?.statuses ?? [],
          sites: data.facets?.sites ?? [],
        }),
      )
      .catch((err) => console.error('META ERROR:', err.message));
  }, []);

  useEffect(() => {
    getOrders({
      page,
      pageSize: PAGE_SIZE,
      q: debouncedSearch,
      site,
      status,
      sort: sort.field,
      order: sort.order,
    })
      .then((data) => setResult(data))
      .catch((err) => console.error('ORDERS ERROR:', err.message));
  }, [page, debouncedSearch, site, status, sort]);

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

  return (
    <div className="app">
      <h1>Sales Order Monitoring</h1>
      <Dashboard summary={result?.summary} />

      <section className="panel" aria-label="Sales orders">
        <div className="panel-head">
          <h2>Orders</h2>
          {result && (
            <span className="muted">
              {result.total} of {result.summary.total_orders} orders
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

        <OrderTable orders={orders} sort={sort} onSort={handleSort} />

        {result && (
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            totalPages={result.totalPages}
            onPage={setPage}
          />
        )}
      </section>
    </div>
  );
}