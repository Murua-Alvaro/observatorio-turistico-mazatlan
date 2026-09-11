import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';
import { airportIntelligence, cruiseIntelligence, hotelIntelligence, marketIntelligence, relativeIntensity, roadIntelligence } from '../lib/intelligence';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onOpenAirport: () => void;
  onOpenBusiness: () => void;
  onOpenHotel: () => void;
  onOpenInsights: () => void;
};

const monthName = (period: string) => new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${period}-01T12:00:00`)).replace('.', '');

export function Panorama({ year, viewMode, compare, onOpenAirport, onOpenBusiness, onOpenHotel, onOpenInsights }: Props) {
  const air = airportIntelligence(year);
  const hotel = hotelIntelligence(year);
  const cruise = cruiseIntelligence(year);
  const market = marketIntelligence(year);
  const road = roadIntelligence();

  let run = 0;
  let runPrev = 0;
  const airChart = air.current.map((d: any, i: number) => {
    run += d.pasajeros_totales_mes_actual;
    const prev = air.previous[i];
    if (prev) runPrev += prev.pasajeros_totales_mes_actual;
    return {
      label: d.label,
      current: viewMode === 'monthly' ? d.pasajeros_totales_mes_actual : run,
      previous: prev ? (viewMode === 'monthly' ? prev.pasajeros_totales_mes_actual : runPrev) : null,
    };
  });

  const calendar = useMemo(() => {
    const months = air.current.map((d: any) => d.periodo);
    const airValues = air.current.map((d: any) => d.pasajeros_totales_mes_actual);
    const cruiseValues = months.map((period: string) => cruise.current.find((d: any) => d.periodo === period)?.pasajeros_mes_actual ?? 0);
    const marketValues = months.map((period: string) => market.monthly.find((d: any) => d.fecha.slice(0, 7) === period)?.valor_entradas ?? 0);
    const ai = relativeIntensity(airValues);
    const ci = relativeIntensity(cruiseValues);
    const mi = relativeIntensity(marketValues);
    return months.map((period: string, i: number) => ({ period, air: airValues[i], cruise: cruiseValues[i], market: marketValues[i], airI: ai[i], cruiseI: ci[i], marketI: mi[i] }));
  }, [year]);

  const occupiedGrowthText = hotel.occupiedGrowth === null ? '—' : pct(hotel.occupiedGrowth, true);
  const capacityGrowthText = hotel.capacityGrowth === null ? '—' : pct(hotel.capacityGrowth, true);
  const cruiseIntensityText = cruise.intensityGrowth === null ? '—' : pct(cruise.intensityGrowth, true);

  return <section className="dataset-page panorama-pro">
    <header className="dataset-heading dataset-heading--editorial">
      <div>
        <span>Panorama ejecutivo · {year}</span>
        <h1>Qué está cambiando en la demanda turística de Mazatlán</h1>
        <p>El observatorio prioriza señales que pueden modificar decisiones de promoción, operación hotelera, inventario, horarios y coordinación empresarial.</p>
      </div>
      <div className="dataset-heading__links"><button onClick={onOpenBusiness}>Comercio</button><button onClick={onOpenHotel}>Hotelería</button><button onClick={onOpenInsights}>Brief ejecutivo</button></div>
    </header>

    <section className="executive-matrix" aria-label="Resumen de inteligencia turística">
      <div className="executive-matrix__head"><span>Señal</span><span>Nivel actual</span><span>Contra referencia</span><span>Lectura</span></div>
      <div><strong>Aeropuerto</strong><b>{integer.format(air.total)}</b><span className={air.yoy >= 0 ? 'positive' : 'negative'}>{compare ? pct(air.yoy, true) : `${air.totalMonths} meses`}</span><p>{air.recentTurnPositive ? 'El acumulado aún rezaga, pero los dos últimos meses disponibles ya son positivos interanualmente.' : 'La conectividad todavía no muestra dos meses consecutivos de mejora interanual.'}</p></div>
      <div><strong>Hotelería</strong><b>{hotel.latest ? `${hotel.latest.ocupacion_pct}%` : '—'}</b><span className={(hotel.occupancyDelta ?? 0) >= 0 ? 'positive' : 'negative'}>{compare && hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : hotel.latest?.periodo ?? '—'}</span><p>{hotel.absorptionSpread !== null && hotel.absorptionSpread > 0 ? `Los cuartos ocupados crecen ${occupiedGrowthText}, por encima de la expansión de oferta (${capacityGrowthText}).` : 'La ocupación debe leerse junto con el cambio de capacidad disponible.'}</p></div>
      <div><strong>Cruceros</strong><b>{cruise.latest ? integer.format(cruise.latest.pasajeros_acumulado_actual) : '—'}</b><span className={(cruise.passengerGrowth ?? 0) >= 0 ? 'positive' : 'negative'}>{cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth, true) : '—'}</span><p>Los arribos cambian {cruise.arrivalGrowth !== null ? pct(cruise.arrivalGrowth, true) : '—'} y los pasajeros por arribo {cruiseIntensityText}; el crecimiento no viene sólo de más escalas.</p></div>
      <div><strong>Mercados internacionales</strong><b>{integer.format(market.total)}</b><span>{market.top2Share.toFixed(1)}% top 2</span><p>{market.leader?.pais ?? '—'} y {market.second?.pais ?? '—'} concentran casi todo el flujo extranjero registrado: oportunidad comercial y riesgo de dependencia.</p></div>
      <div><strong>Accesibilidad terrestre</strong><b>{integer.format(road.max)}</b><span>TDPA máximo</span><p>El corredor de mayor aforo registra {road.concentrationRatio.toFixed(1)} veces la mediana de las estaciones principales vinculadas con Mazatlán.</p></div>
    </section>

    <section className="briefing-grid">
      <article className="briefing-main">
        <span className="section-eyebrow">Lectura del momento</span>
        <h2>{air.recentTurnPositive ? 'La señal reciente mejora, pero el año sigue siendo mixto.' : 'La demanda continúa mostrando señales desiguales entre canales.'}</h2>
        <p>La conectividad aérea acumula {pct(air.yoy, true)} en el tramo comparable. Al mismo tiempo, la ocupación hotelera cambia {hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : '—'} y los pasajeros de crucero {cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth, true) : '—'}. Esto indica que no existe un único “pulso turístico”: cada canal está evolucionando a una velocidad diferente.</p>
        <button onClick={onOpenInsights}>Abrir brief con implicaciones</button>
      </article>
      <aside className="briefing-side">
        <div><span>Mezcla aérea internacional</span><strong>{air.internationalShare.toFixed(1)}%</strong><small>del total de pasajeros del tramo disponible</small></div>
        <div><span>Meses positivos interanuales</span><strong>{air.positiveMonths}/{air.totalMonths}</strong><small>en el año seleccionado</small></div>
        <div><span>Absorción hotelera</span><strong>{hotel.absorptionSpread !== null ? `${hotel.absorptionSpread.toFixed(1)} pp` : '—'}</strong><small>crecimiento de ocupados menos crecimiento de oferta</small></div>
        <div><span>Intensidad por arribo</span><strong>{cruise.paxPerArrival ? integer.format(Math.round(cruise.paxPerArrival)) : '—'}</strong><small>pasajeros acumulados por arribo</small></div>
      </aside>
    </section>

    <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Conectividad</span><h2>Pasajeros aéreos y cambio de tendencia</h2></div><button onClick={onOpenAirport}>Abrir detalle</button></div>
      <div className="analysis-block__grid">
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={airChart} margin={{top:12,right:18,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d9dfe3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare ? <Area type="monotone" dataKey="previous" name={`${year - 1}`} stroke="#9aa4ab" strokeDasharray="5 4" fill="transparent"/> : null}<Area type="monotone" dataKey="current" name={`${year}`} stroke="#1769aa" strokeWidth={2.4} fill="#eaf2f8"/></AreaChart></ResponsiveContainer></ChartFrame>
        <div className="fact-sheet">
          <div><span>Pico del año</span><strong>{air.peak ? `${monthName(air.peak.periodo)} · ${integer.format(air.peak.pasajeros_totales_mes_actual)}` : '—'}</strong></div>
          <div><span>Valle del año</span><strong>{air.trough ? `${monthName(air.trough.periodo)} · ${integer.format(air.trough.pasajeros_totales_mes_actual)}` : '—'}</strong></div>
          <div><span>Mercado doméstico</span><strong>{air.domesticShare.toFixed(1)}%</strong></div>
          <div><span>Mercado internacional</span><strong>{air.internationalShare.toFixed(1)}%</strong></div>
          <p>Para comercio y hotelería, el cambio reciente importa tanto como el acumulado: permite distinguir una recuperación en el margen de un año todavía débil.</p>
        </div>
      </div>
    </section>

    <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Calendario de presión</span><h2>Intensidad relativa por canal</h2></div><small>Cada fila se normaliza dentro de su propia fuente; no se suman canales.</small></div>
      <div className="heat-table">
        <div className="heat-table__head"><span>Canal</span>{calendar.map((m: any) => <b key={m.period}>{monthName(m.period)}</b>)}</div>
        <HeatRow label="Aeropuerto" values={calendar.map((m: any) => ({ value: m.air, intensity: m.airI }))} format={(v) => `${Math.round(v / 1000)}k`} />
        <HeatRow label="Cruceros" values={calendar.map((m: any) => ({ value: m.cruise, intensity: m.cruiseI }))} format={(v) => v ? `${Math.round(v / 1000)}k` : '—'} />
        <HeatRow label="Entradas extranjeras" values={calendar.map((m: any) => ({ value: m.market, intensity: m.marketI }))} format={(v) => v ? `${Math.round(v / 1000)}k` : '—'} />
      </div>
      <p className="section-caption">La matriz ayuda a identificar ventanas de mayor presión comercial y operativa sin convertir fuentes distintas en una cifra artificial de turistas.</p>
    </section>

    <section className="two-up-intelligence">
      <div>
        <div className="analysis-block__head"><div><span>Hotelería</span><h2>Oferta vs. absorción</h2></div><button onClick={onOpenHotel}>Abrir módulo</button></div>
        <table className="comparison-table"><thead><tr><th>Indicador</th><th>{year - 1}</th><th>{year}</th><th>Cambio</th></tr></thead><tbody><tr><td>Ocupación al mismo corte</td><td>{hotel.sameCutPrevious ? `${hotel.sameCutPrevious.ocupacion_pct}%` : '—'}</td><td>{hotel.latest ? `${hotel.latest.ocupacion_pct}%` : '—'}</td><td>{hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : '—'}</td></tr><tr><td>Cuartos disponibles</td><td>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_disponibles_promedio_diario) : '—'}</td><td>{hotel.latest ? integer.format(hotel.latest.cuartos_disponibles_promedio_diario) : '—'}</td><td>{capacityGrowthText}</td></tr><tr><td>Cuartos ocupados</td><td>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_ocupados) : '—'}</td><td>{hotel.latest ? integer.format(hotel.latest.cuartos_ocupados) : '—'}</td><td>{occupiedGrowthText}</td></tr></tbody></table>
      </div>
      <div>
        <div className="analysis-block__head"><div><span>Mercados</span><h2>Exposición internacional</h2></div></div>
        <div className="market-brief"><div className="market-brief__headline"><strong>{market.top2Share.toFixed(1)}%</strong><span>del flujo extranjero se concentra en los dos principales mercados</span></div>{market.countries.slice(0, 5).map((d:any, i:number) => <div className="market-brief__row" key={d.pais}><span>{i + 1}. {d.pais}</span><b>{integer.format(d.valor_entradas)}</b><i style={{width:`${market.leader ? d.valor_entradas / market.leader.valor_entradas * 100 : 0}%`}}/></div>)}</div>
      </div>
    </section>
  </section>;
}

function HeatRow({ label, values, format }: { label: string; values: Array<{ value: number; intensity: number }>; format: (value: number) => string }) {
  return <div className="heat-table__row"><strong>{label}</strong>{values.map((item, i) => <span key={i} style={{ '--heat': item.intensity } as React.CSSProperties} title={integer.format(item.value)}>{format(item.value)}</span>)}</div>;
}
