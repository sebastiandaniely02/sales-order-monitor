const currencyFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
});

const numberFormatter = new Intl.NumberFormat('en-MY');

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  timeZone: 'Asia/Kuala_Lumpur',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCurrency(value) {
  return typeof value === 'number' ? currencyFormatter.format(value) : '-';
}

export function formatNumber(value) {
  return numberFormatter.format(value ?? 0);
}

export function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
}