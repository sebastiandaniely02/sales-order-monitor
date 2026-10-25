const STATUS_CLASS = {
  'Open order': 'open',
  Invoiced: 'invoiced',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

export default function StatusBadge({ status }) {
  const tone = STATUS_CLASS[status] ?? 'other';
  return <span className={`badge badge-${tone}`}>{status ?? 'Unknown'}</span>;
}