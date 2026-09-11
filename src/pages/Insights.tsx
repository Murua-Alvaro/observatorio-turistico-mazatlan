import { useMemo, useState } from 'react';
import { airport, cruises, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';

type Props = {
  year: ObservatoryYear;
  onNavigate: (tab: 'business' | 'hotel' | 'airport' | 'cruises' | 'markets') => void;
};

type Audience = 'business' | 'hotel';

export function Insights({ year, onNavigate }: Props) {
  const [audience, setAudience] = useState<Audience>('business');
  const air = airport.filter((d: any) => d.periodo.startsWith(String(year)));
  const airPrev = airport.filter((d: any) => d.periodo.startsWith(String(year - 1))).slice(0, air.length);
  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const cruisesYear = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestHotel = hotelYear.at(-1);
  const latestCruise = cruisesYear.at(-1);

  const airYtd = air.reduce((sum: number, d: any) => sum + d.pasajeros_totales_mes_actual, 0);
  const airPrevYtd = airPrev.reduce((sum: number, d: any) => sum + d.pasajeros_totales_mes_actual, 0);
  const airYoy = airPrevYtd ? ((airYtd / airPrevYtd) - 1) * 100 : 0;

  const sameCutPrevHotel = latestHotel ? hotel.find((d: any) => d.periodo === `${year - 1}-${latestHotel.periodo.slice(5)}`) : null;
  const hotelDelta = sameCutPrevHotel && latestHotel ? latestHotel.ocupacion_pct - sameCutPrevHotel.ocupacion_pct : null;
  const cruisePrev = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = cruisePrev && latestCruise ? ((latestCruise.pasajeros_acumulado_actual / cruisePrev.pasajeros_acumulado_actual) - 1) * 100 : null;

  const countries = useMemo(() => data.nationality.countries.filter((d: any) => Number(d.anio) === year).sort((a: any, b: any) => b.valor_entradas - a.valor_entradas), [year]);
  const foreignTotal = countries.reduce((sum: number, d: any) => sum + d.valor_entradas, 0);
  const top2Share = foreignTotal ? countries.slice(0, 2).reduce((sum: number, d: any) => sum + d.valor_entradas, 0) / foreignTotal * 100 : 0;
  const hotelFirst = hotelYear.at(0);
  const capacityChange = hotelFirst && latestHotel ? ((latestHotel.cuartos_disponibles_promedio_diario / hotelFirst.cuartos_disponibles_promedio_diario) - 1) * 100 : 0;

  const rows = [
    { signal: airYoy >= 0 ? 'Mejora' : 'Atención', area: 'Conectividad aérea', evidence: `${pct(airYoy,true)} frente al tramo comparable`, implication: audience === 'business' ? 'Ajustar calendario comercial al ritmo de llegadas.' : 'Usar como contexto de demanda, no como noches-habitación.', action: 'Abrir aeropuerto', tab: 'airport' as const },
    { signal: hotelDelta !== null && hotelDelta >= 0 ? 'Mejora' : 'Seguimiento', area: 'Hotelería', evidence: hotelDelta === null ? 'Sin corte comparable' : `${pp(hotelDelta)} frente al mismo corte`, implication: audience === 'business' ? 'Señal de actividad alojada; no equivale a ventas del comercio.' : `Leer junto con cambio de capacidad de ${pct(capacityChange,true)}.`, action: 'Abrir hotelería', tab: 'hotel' as const },
    { signal: cruiseYoy !== null && cruiseYoy >= 0 ? 'Expansión' : 'Seguimiento', area: 'Cruceros', evidence: latestCruise ? `${integer.format(latestCruise.pasajeros_acumulado_actual)} pasajeros acumulados` : 'Sin datos', implication: audience === 'business' ? 'Relevante para comercio, tours y servicios de corta estancia.' : 'No debe sumarse a demanda hotelera.', action: 'Abrir cruceros', tab: 'cruises' as const },
    { signal: top2Share >= 80 ? 'Concentración' : 'Diversificación', area: 'Mercados de origen', evidence: `${top2Share.toFixed(1)}% en los dos principales mercados`, implication: audience === 'business' ? 'Priorizar campañas y reducir dependencia de pocos mercados.' : 'Orientar promoción hotelera por mercado emisor.', action: 'Abrir mercados', tab: 'markets' as const },
  ];

  return <section className="dataset-page">
    <header className="dataset-heading">
      <div><span>Análisis / hallazgos</span><h1>Registro de señales para decisión</h1><p>Una lectura editorial de los datos disponibles. Cada fila separa señal, evidencia e implicación operativa.</p></div>
      <div className="dataset-heading__links"><button className={audience === 'business' ? 'active' : ''} onClick={() => setAudience('business')}>Empresas</button><button className={audience === 'hotel' ? 'active' : ''} onClick={() => setAudience('hotel')}>Hotelería</button></div>
    </header>

    <div className="signal-register-table">
      <div className="signal-register-table__head"><span>Señal</span><span>Área</span><span>Evidencia</span><span>Implicación</span><span></span></div>
      {rows.map((row) => <div className="signal-register-table__row" key={row.area}><span><i className={`status ${row.signal === 'Atención' || row.signal === 'Concentración' ? 'warn' : row.signal === 'Seguimiento' ? 'neutral' : 'good'}`}>{row.signal}</i></span><strong>{row.area}</strong><span>{row.evidence}</span><p>{row.implication}</p><button onClick={() => onNavigate(row.tab)}>{row.action}</button></div>)}
    </div>

    <details className="dataset-disclosure" open><summary>Agenda prioritaria para {audience === 'business' ? 'cámaras y empresas' : 'operación hotelera'}</summary><div className="application-list">{audience === 'business' ? <><div><strong>Calendarizar campañas con el pulso de llegada</strong><p>Use meses fuertes y débiles como señal para promoción, horarios y abasto.</p></div><div><strong>Diversificar mercados</strong><p>La concentración top 2 es una exposición comercial que conviene monitorear.</p></div><div><strong>Separar cruceros de alojamiento</strong><p>El crucerista requiere una estrategia de consumo distinta a la del huésped.</p></div></> : <><div><strong>Comparar ocupación sólo a cortes equivalentes</strong><p>No promediar porcentajes acumulados como si fueran meses independientes.</p></div><div><strong>Leer ocupación junto con oferta</strong><p>El cambio de capacidad altera la interpretación del desempeño.</p></div><div><strong>Usar conectividad como contexto</strong><p>El aeropuerto ayuda a leer presión de demanda, no ventas de habitaciones.</p></div></>}</div></details>

    <div className="method-note"><strong>Regla del observatorio</strong><span>No se convierten pasajeros, aforos o entradas migratorias en estimaciones no observadas de ventas, turistas únicos o derrama.</span></div>
  </section>;
}
