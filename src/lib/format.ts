export const integer = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
export const decimal = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });

export function pct(value: number, withSign = false) {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${decimal.format(value)}%`;
}

export function pp(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${decimal.format(value)} pp`;
}

export function compact(value: number) {
  return new Intl.NumberFormat('es-MX', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function monthLabel(period: string) {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}
