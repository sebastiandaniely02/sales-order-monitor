import { useEffect } from 'react';
import { getMeta, getOrders } from './api/salesOrders';

export default function App() {
  useEffect(() => {
    getMeta()
      .then((data) => console.log('META:', data))
      .catch((err) => console.error('META ERROR:', err.message));

    getOrders({ page: 1, pageSize: 5 })
      .then((data) => console.log('ORDERS:', data))
      .catch((err) => console.error('ORDERS ERROR:', err.message));
  }, []);

  return <h1>Sales Order Monitoring</h1>;
}