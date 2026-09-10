import { airport, cruises, data, hotel } from '../data/model';

export type ObservatoryYear = 2025 | 2026;

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadObservatoryCsv(year: ObservatoryYear) {
  const rows: Array<Record<string, string | number>> = [];
  const prefix = String(year);

  airport.filter((d: any) => d.periodo.startsWith(prefix)).forEach((d: any) => {
    rows.push({ modulo: 'aeropuerto', periodo: d.periodo, indicador: 'pasajeros_totales', valor: d.pasajeros_totales_mes_actual, unidad: 'pasajeros', fuente: 'OMA' });
    rows.push({ modulo: 'aeropuerto', periodo: d.periodo, indicador: 'pasajeros_nacionales', valor: d.pasajeros_nacionales_mes_actual, unidad: 'pasajeros', fuente: 'OMA' });
    rows.push({ modulo: 'aeropuerto', periodo: d.periodo, indicador: 'pasajeros_internacionales', valor: d.pasajeros_internacionales_mes_actual, unidad: 'pasajeros', fuente: 'OMA' });
  });

  hotel.filter((d: any) => d.periodo.startsWith(prefix)).forEach((d: any) => {
    rows.push({ modulo: 'hoteleria', periodo: d.periodo, indicador: 'ocupacion_acumulada', valor: d.ocupacion_pct, unidad: 'porcentaje', fuente: 'DataTur' });
    rows.push({ modulo: 'hoteleria', periodo: d.periodo, indicador: 'cuartos_disponibles_promedio_diario', valor: d.cuartos_disponibles_promedio_diario, unidad: 'cuartos', fuente: 'DataTur' });
    rows.push({ modulo: 'hoteleria', periodo: d.periodo, indicador: 'cuartos_ocupados', valor: d.cuartos_ocupados, unidad: 'cuartos', fuente: 'DataTur' });
  });

  cruises.filter((d: any) => d.periodo.startsWith(prefix)).forEach((d: any) => {
    rows.push({ modulo: 'cruceros', periodo: d.periodo, indicador: 'pasajeros_mes', valor: d.pasajeros_mes_actual, unidad: 'pasajeros', fuente: 'DataTur / SEMAR' });
    rows.push({ modulo: 'cruceros', periodo: d.periodo, indicador: 'arribos_acumulados', valor: d.arribos_acumulado_actual, unidad: 'arribos', fuente: 'DataTur / SEMAR' });
  });

  data.nationality.monthly.filter((d: any) => String(d.anio) === prefix).forEach((d: any) => {
    rows.push({ modulo: 'mercados', periodo: d.fecha.slice(0, 7), indicador: 'entradas_extranjeras', valor: d.valor_entradas, unidad: 'entradas', fuente: 'UPM / DataTur' });
  });

  const headers = ['modulo', 'periodo', 'indicador', 'valor', 'unidad', 'fuente'];
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))].join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `observatorio-turistico-mazatlan-${year}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function printExecutiveReport() {
  window.print();
}
