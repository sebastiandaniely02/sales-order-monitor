import { useEffect, useState } from 'react';
import { getMeta, getOrders } from './api/salesOrders';
import useDebounce from './hooks/useDebounce';
import Dashboard from './components/Dashboard';
import Filters from './components/Filters';
import OrderTable from './components/OrderTable';
import './App.css';

export default function App() {
  const [meta, setMeta] = useState({ statuses: [], sites: [] });
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');
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
    getOrders({ page: 1, pageSize: 25, q: debouncedSearch, site, status })
      .then((data) => setResult(data))
      .catch((err) => console.error('ORDERS ERROR:', err.message));
  }, [debouncedSearch, site, status]);

  function clearFilters() {
    setSearch('');
    setSite('');
    setStatus('');
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
          onSearch={setSearch}
          site={site}
          onSite={setSite}
          status={status}
          onStatus={setStatus}
          sites={meta.sites}
          statuses={meta.statuses}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />

        <OrderTable orders={orders} />
      </section>
    </div>
  );
}