import { useState } from 'react';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import { airportIntelligence, cruiseIntelligence, hotelIntelligence, marketIntelligence, roadIntelligence } from '../lib/intelligence';

type Props = {
  year: ObservatoryYear;
  onNavigate: (tab: 'business' | 'hotel' | 'airport' | 'cruises' | 'markets') => void;
};

type Audience = 'business' | 'hotel';

export function Insights({ year, onNavigate }: Props) {
  const [audience, setAudience] = useState<Audience>('business');
  const air = airportIntelligence(year);
  const hotel = hotelIntelligence(year);
  const cruise = cruiseIntelligence(year);
  const market = marketIntelligence(year);
  const road = roadIntelligence();

  const rows = audience === 'business' ? [
    {
      priority: air.recentTurnPositive ? 'Alta' : 'Media',
      signal: 'Recuperación aérea reciente',
      evidence: `${integer.format(air.total)} pasajeros; ${pct(air.yoy, true)} acumulado`,
      implication: air.recentTurnPositive ? 'Los dos últimos meses disponibles son positivos interanualmente: preparar inventario, horarios y campañas sin asumir que el rezago anual ya desapareció.' : 'Todavía no hay una secuencia reciente suficientemente clara de recuperación.',
      action: 'Abrir aeropuerto', tab: 'airport' as const,
    },
    {
      priority: 'Alta',
      signal: 'Crecimiento del crucerismo',
      evidence: `${integer.format(cruise.latest?.pasajeros_acumulado_actual ?? 0)} pasajeros; ${cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth, true) : '—'}`,
      implication: `Los arribos cambian ${cruise.arrivalGrowth !== null ? pct(cruise.arrivalGrowth, true) : '—'} y la intensidad por escala ${cruise.intensityGrowth !== null ? pct(cruise.intensityGrowth, true) : '—'}. Relevante para comercio de corta estancia y tours.`,
      action: 'Abrir cruceros', tab: 'cruises' as const,
    },
    {
      priority: 'Alta',
      signal: 'Dependencia de pocos mercados extranjeros',
      evidence: `${market.top2Share.toFixed(1)}% concentrado en ${market.leader?.pais ?? '—'} y ${market.second?.pais ?? '—'}`,
      implication: 'La segmentación comercial puede ser muy precisa, pero la dependencia aumenta la exposición a shocks de conectividad, percepción y poder adquisitivo en pocos mercados.',
      action: 'Abrir mercados', tab: 'markets' as const,
    },
    {
      priority: 'Media',
      signal: 'Concentración carretera',
      evidence: `${integer.format(road.max)} TDPA máximo; ${road.concentrationRatio.toFixed(1)}× la mediana`,
      implication: 'Los principales corredores deben considerarse en logística, abasto y campañas dirigidas al visitante regional.',
      action: 'Abrir comercio', tab: 'business' as const,
    },
  ] : [
    {
      priority: 'Alta',
      signal: 'Ocupación mejora a corte equivalente',
      evidence: hotel.occupancyDelta !== null ? `${hotel.latest?.ocupacion_pct ?? '—'}%; ${pp(hotel.occupancyDelta)} interanual` : 'Sin corte comparable',
      implication: 'El desempeño hotelero mejora aun con una base de oferta mayor; debe leerse junto con capacidad y cuartos ocupados.',
      action: 'Abrir hotelería', tab: 'hotel' as const,
    },
    {
      priority: 'Alta',
      signal: 'Absorción de nueva capacidad',
      evidence: `${hotel.occupiedGrowth !== null ? pct(hotel.occupiedGrowth, true) : '—'} ocupados vs ${hotel.capacityGrowth !== null ? pct(hotel.capacityGrowth, true) : '—'} oferta`,
      implication: hotel.absorptionSpread !== null && hotel.absorptionSpread > 0 ? `Los cuartos ocupados crecen ${hotel.absorptionSpread.toFixed(1)} pp más rápido que la capacidad. Es una señal operativa favorable.` : 'La capacidad está creciendo al mismo ritmo o más rápido que los cuartos ocupados; vigilar presión competitiva.',
      action: 'Abrir hotelería', tab: 'hotel' as const,
    },
    {
      priority: 'Media',
      signal: 'Conectividad aún no recupera todo el acumulado',
      evidence: `${integer.format(air.total)} pasajeros; ${pct(air.yoy, true)}`,
      implication: air.recentTurnPositive ? 'La mejora de los últimos dos meses es una señal adelantada útil para reservas futuras, pero aún no borra el rezago acumulado.' : 'La conectividad sigue débil y puede limitar presión de demanda futura.',
      action: 'Abrir aeropuerto', tab: 'airport' as const,
    },
    {
      priority: 'Alta',
      signal: 'Alta concentración internacional',
      evidence: `${market.top2Share.toFixed(1)}% en dos mercados`,
      implication: 'El hotelero debe vigilar promoción, conectividad y desempeño comercial de Canadá y Estados Unidos de forma diferenciada.',
      action: 'Abrir mercados', tab: 'markets' as const,
    },
  ];

  return <section className="dataset-page brief-page">
    <header className="dataset-heading dataset-heading--editorial">
      <div><span>Brief ejecutivo · {year}</span><h1>Señales que requieren decisión</h1><p>Resumen priorizado para reuniones de cámaras empresariales, asociaciones hoteleras y equipos de planeación.</p></div>
      <div className="audience-toggle"><button className={audience === 'business' ? 'active' : ''} onClick={() => setAudience('business')}>Comercio</button><button className={audience === 'hotel' ? 'active' : ''} onClick={() => setAudience('hotel')}>Hotelería</button></div>
    </header>

    <section className="brief-register">
      <div className="brief-register__head"><span>Prioridad</span><span>Señal</span><span>Evidencia</span><span>Implicación</span><span></span></div>
      {rows.map((row) => <div className="brief-register__row" key={row.signal}><span className={`priority priority--${row.priority.toLowerCase()}`}>{row.priority}</span><strong>{row.signal}</strong><b>{row.evidence}</b><p>{row.implication}</p><button onClick={() => onNavigate(row.tab)}>{row.action}</button></div>)}
    </section>

    <section className="brief-summary">
      <div><span>Conectividad aérea</span><strong>{pct(air.yoy, true)}</strong><small>{air.positiveMonths}/{air.totalMonths} meses positivos</small></div>
      <div><span>Ocupación hotelera</span><strong>{hotel.latest ? `${hotel.latest.ocupacion_pct}%` : '—'}</strong><small>{hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : 'sin comparación'}</small></div>
      <div><span>Cruceros</span><strong>{cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth, true) : '—'}</strong><small>{cruise.latest ? integer.format(cruise.latest.pasajeros_acumulado_actual) : '—'} pasajeros</small></div>
      <div><span>Concentración internacional</span><strong>{market.top2Share.toFixed(1)}%</strong><small>top 2 mercados</small></div>
    </section>

    <p className="method-footnote">Las señales no suman fuentes diferentes ni estiman turistas únicos, ventas o derrama no observada. Cada indicador conserva la definición de su fuente.</p>
  </section>;
}
