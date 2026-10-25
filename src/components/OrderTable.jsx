import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

const COLUMNS = [
  { key: 'SalesId', label: 'Order No.', sortable: true },
  { key: 'SalesName', label: 'Customer', sortable: false },
  { key: 'InventSiteId', label: 'Site', sortable: true },
  { key: 'CreatedDateTime1', label: 'Order Date', sortable: true },
  { key: 'SalesStatus', label: 'Status', sortable: true },
  { key: 'HAR_TotalSOAmount', label: 'Amount', sortable: true, numeric: true },
];

export default function OrderTable({ orders, sort, onSort, loading }) {
  return (
    <div className={`table-wrap ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
      <table className="orders">
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = sort.field === col.key;
              return (
                <th
                  key={col.key}
                  className={col.numeric ? 'num' : ''}
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
              <td data-label="Order No." className="mono">{order.SalesId}</td>
              <td data-label="Customer">
                <span className="cell-stack">
                  <span>{order.SalesName}</span>
                  <small className="muted">{order.CustAccount}</small>
                </span>
              </td>
              <td data-label="Site">{order.InventSiteId}</td>
              <td data-label="Order Date">{formatDate(order.CreatedDateTime1)}</td>
              <td data-label="Status"><StatusBadge status={order.SalesStatus} /></td>
              <td data-label="Amount" className="num">{formatCurrency(order.HAR_TotalSOAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}