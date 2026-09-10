import fs from 'node:fs';

const path = new URL('../src/data/generated/observatory.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const checks = [
  ['airport coverage ends 2026-08', data.airport.at(-1)?.periodo === '2026-08'],
  ['hotel monthly values are identified as cumulative cuts', data.hotel.monthly.every((x) => x.alcance_medicion === 'acumulado_al_mes')],
  ['hotel coverage ends 2026-06', data.hotel.monthly.at(-1)?.periodo === '2026-06'],
  ['cruise coverage ends 2026-07', data.cruises.at(-1)?.periodo === '2026-07'],
  ['corrected OMA June 2026 total', data.airport.find((x) => x.periodo === '2026-06')?.pasajeros_totales_mes_actual === 125653],
  ['corrected OMA July 2026 total', data.airport.find((x) => x.periodo === '2026-07')?.pasajeros_totales_mes_actual === 154631],
  ['no empty sources', data.meta.sources.length >= 5],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
