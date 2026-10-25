import { useEffect, useState } from 'react';
import { getOrders } from './api/salesOrders';
import Dashboard from './components/Dashboard';
import OrderTable from './components/OrderTable';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    getOrders({ page: 1, pageSize: 25 })
      .then((data) => setResult(data))
      .catch((err) => console.error('ORDERS ERROR:', err.message));
  }, []);

  const orders = result?.data ?? [];

  return (
    <div className="app">
      <h1>Sales Order Monitoring</h1>
      <Dashboard summary={result?.summary} />
      <OrderTable orders={orders} />
    </div>
  );
}