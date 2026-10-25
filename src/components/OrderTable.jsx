import { formatCurrency, formatDate } from '../utils/format';

const COLUMNS = [
  { key: 'SalesId', label: 'Order No.', sortable: true },
  { key: 'SalesName', label: 'Customer', sortable: false },
  { key: 'InventSiteId', label: 'Site', sortable: true },
  { key: 'CreatedDateTime1', label: 'Order Date', sortable: true },
  { key: 'SalesStatus', label: 'Status', sortable: true },
  { key: 'HAR_TotalSOAmount', label: 'Amount', sortable: true },
];

export default function OrderTable({ orders, sort, onSort }) {
  return (
    <table className="orders">
      <thead>
        <tr>
          {COLUMNS.map((col) => {
            const active = sort.field === col.key;
            return (
              <th
                key={col.key}
                aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col.sortable ? (
                  <button type="button" className="sort-btn" onClick={() => onSort(col.key)}>
                    {col.label}
                    <span className="sort-icon">
                      {active ? (sort.order === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.SalesId}>
            <td>{order.SalesId}</td>
            <td>{order.SalesName}</td>
            <td>{order.InventSiteId}</td>
            <td>{formatDate(order.CreatedDateTime1)}</td>
            <td>{order.SalesStatus}</td>
            <td>{formatCurrency(order.HAR_TotalSOAmount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}