import raw from './generated/observatory.json';

export const data = raw as any;

export const airport = data.airport.map((d: any) => ({ ...d, label: periodLabel(d.periodo) }));
export const hotel = data.hotel.monthly.map((d: any) => ({ ...d, label: periodLabel(d.periodo) }));
export const cruises = data.cruises.map((d: any) => ({ ...d, label: periodLabel(d.periodo) }));
export const nationalityMonthly = data.nationality.monthly.map((d: any) => ({
  ...d,
  label: periodLabel(d.fecha.slice(0, 7)),
}));
export const topCountries2026 = data.nationality.countries
  .filter((d: any) => d.anio === 2026)
  .slice(0, 8);
export const busiestRoads = [...data.road]
  .sort((a: any, b: any) => b.tdpa - a.tdpa)
  .slice(0, 8);

function periodLabel(period: string) {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}
