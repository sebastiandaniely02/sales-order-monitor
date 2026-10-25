import { formatCurrency, formatNumber } from '../utils/format';

export default function Dashboard({ summary }) {
    if (!summary) {
    return (
      <section className="cards" aria-label="Order summary loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card skeleton" />
        ))}
      </section>
    );
  }

  const completed = summary.invoiced_orders + summary.delivered_orders;

  const cards = [
    { label: 'Total orders', value: formatNumber(summary.total_orders) },
    { label: 'Open / pending', value: formatNumber(summary.open_orders), tone: 'open' },
    {
      label: 'Completed',
      value: formatNumber(completed),
      hint: `${formatNumber(summary.invoiced_orders)} invoiced · ${formatNumber(summary.delivered_orders)} delivered`,
      tone: 'done',
    },
    { label: 'Cancelled', value: formatNumber(summary.cancelled_orders), tone: 'cancelled' },
    { label: 'Total order value', value: formatCurrency(summary.total_order_value) },
  ];

  return (
    <section className="cards" aria-label="Order summary">
      {cards.map((card) => (
        <div key={card.label} className={`card ${card.tone ? `tone-${card.tone}` : ''}`}>
          <span className="card-label">{card.label}</span>
          <strong className="card-value">{card.value}</strong>
          {card.hint && <small className="muted">{card.hint}</small>}
        </div>
      ))}
    </section>
  );
}