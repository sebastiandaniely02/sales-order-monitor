import { useEffect, useState } from 'react';
import { getOrders } from './api/salesOrders';
import OrderTable from './components/OrderTable';

export default function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders({ page: 1, pageSize: 25 })
      .then((data) => setOrders(data.data))
      .catch((err) => console.error('ORDERS ERROR:', err.message));
  }, []);

  return (
    <div>
      <h1>Sales Order Monitoring</h1>
      <OrderTable orders={orders} />
    </div>
  );
}