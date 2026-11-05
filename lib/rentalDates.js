export function isRentalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function rentalDates({ from, to }) {
  const start = isRentalDate(from) ? from : '';
  const end = isRentalDate(to) && (!start || to >= start) ? to : '';
  return { from: start, to: end };
}

export function todayInPoland() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}
