import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { integer, pct } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';
import { airportIntelligence, cruiseIntelligence, marketIntelligence, relativeIntensity, roadIntelligence } from '../lib/intelligence';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

type Focus = 'calendar' | 'markets' | 'access';
const monthName = (period: string) => new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date(`${period}-01T12:00:00`));

export function Business({ year, viewMode, compare, onNavigate }: Props) {
  const [focus, setFocus] = useState<Focus>('calendar');
  const air = airportIntelligence(year);
  const cruise = cruiseIntelligence(year);
  const market = marketIntelligence(year);
  const road = roadIntelligence();

  let running = 0;
  let runningPrev = 0;
  const airChart = air.current.map((d: any, i: number) => {
    running += d.pasajeros_totales_mes_actual;
    const prev = air.previous[i];
    if (prev) runningPrev += prev.pasajeros_totales_mes_actual;
    return { label: d.label, current: viewMode === 'monthly' ? d.pasajeros_totales_mes_actual : running, previous: prev ? (viewMode === 'monthly' ? prev.pasajeros_totales_mes_actual : runningPrev) : null };
  });

  const planningCalendar = useMemo(() => {
    const airIntensity = relativeIntensity(air.current.map((d: any) => d.pasajeros_totales_mes_actual));
    return air.current.map((d: any, i: number) => {
      const cruiseMonth = cruise.current.find((c: any) => c.periodo === d.periodo);
      const marketMonth = market.monthly.find((m: any) => m.fecha.slice(0, 7) === d.periodo);
      const score = airIntensity[i];
      return {
        period: d.periodo,
        air: d.pasajeros_totales_mes_actual,
        airYoy: d.yoy_total_pct,
        cruise: cruiseMonth?.pasajeros_mes_actual ?? null,
        foreign: marketMonth?.valor_entradas ?? null,
        pressure: score >= .67 ? 'Alta' : score >= .34 ? 'Media' : 'Baja',
      };
    });
  }, [year]);

  const leaderShare = market.total && market.leader ? market.leader.valor_entradas / market.total * 100 : 0;

  return <section className="dataset-page sector-page">
    <header className="dataset-heading dataset-heading--editorial">
      <div><span>Comercio y servicios · {year}</span><h1>Inteligencia de demanda para cámaras empresariales</h1><p>La utilidad no está en contar gráficas: está en saber cuándo aumenta la presión de demanda, qué mercados la sostienen y por qué canales llega.</p></div>
      <div className="dataset-heading__links"><button onClick={() => onNavigate('insights')}>Brief ejecutivo</button><button onClick={() => onNavigate('markets')}>Mercados</button><button onClick={() => onNavigate('mobility')}>Movilidad</button></div>
    </header>

    <section className="decision-matrix">
      <div className="decision-matrix__head"><span>Pregunta empresarial</span><span>Evidencia actual</span><span>Señal</span><span>Implicación</span></div>
      <div><strong>¿La demanda está recuperándose?</strong><span>{integer.format(air.total)} pasajeros aéreos acumulados</span><b className={air.yoy >= 0 ? 'positive' : 'negative'}>{pct(air.yoy, true)}</b><p>{air.recentTurnPositive ? 'El acumulado sigue débil, pero los dos últimos meses disponibles ya son positivos. Conviene preparar operación para una recuperación en el margen.' : 'Aún no hay una secuencia reciente suficientemente clara de recuperación.'}</p></div>
      <div><strong>¿Qué tan dependiente es el mercado internacional?</strong><span>{market.leader?.pais ?? '—'} lidera con {leaderShare.toFixed(1)}%</span><b>{market.top2Share.toFixed(1)}% top 2</b><p>La concentración facilita campañas dirigidas, pero hace al comercio más sensible a cambios en pocos mercados emisores.</p></div>
      <div><strong>¿El crucerismo está aportando más presión comercial?</strong><span>{cruise.latest ? integer.format(cruise.latest.pasajeros_acumulado_actual) : '—'} pasajeros</span><b className={(cruise.passengerGrowth ?? 0) >= 0 ? 'positive' : 'negative'}>{cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth, true) : '—'}</b><p>El crecimiento combina más arribos y mayor intensidad por escala; es especialmente relevante para comercio de corta estancia, tours y servicios.</p></div>
      <div><strong>¿Dónde se concentra la accesibilidad carretera?</strong><span>{integer.format(road.max)} TDPA en el principal punto</span><b>{road.concentrationRatio.toFixed(1)}× mediana</b><p>Los corredores de mayor aforo son relevantes para logística, abasto y campañas orientadas al visitante regional.</p></div>
    </section>

    <div className="section-switcher">
      <label><span>Pregunta a explorar</span><select value={focus} onChange={(e) => setFocus(e.target.value as Focus)}><option value="calendar">¿Cuándo aumenta la presión de demanda?</option><option value="markets">¿Qué mercados son prioritarios?</option><option value="access">¿Por dónde llega el flujo regional?</option></select></label>
      <span>Los módulos cambian sin perder el año seleccionado.</span>
    </div>

    {focus === 'calendar' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Estacionalidad comercial</span><h2>Calendario de presión de demanda</h2></div><small>La categoría Alta/Media/Baja se calcula dentro del flujo aéreo del año, no como pronóstico de ventas.</small></div>
      <div className="analysis-block__grid">
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={airChart} margin={{top:12,right:12,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d9dfe3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare ? <Bar dataKey="previous" name={`${year - 1}`} fill="#d5dade"/> : null}<Bar dataKey="current" name={`${year}`} fill="#1769aa"/></BarChart></ResponsiveContainer></ChartFrame>
        <div className="fact-sheet"><div><span>Pico del año</span><strong>{air.peak ? `${monthName(air.peak.periodo)} · ${integer.format(air.peak.pasajeros_totales_mes_actual)}` : '—'}</strong></div><div><span>Valle del año</span><strong>{air.trough ? `${monthName(air.trough.periodo)} · ${integer.format(air.trough.pasajeros_totales_mes_actual)}` : '—'}</strong></div><div><span>Meses positivos</span><strong>{air.positiveMonths}/{air.totalMonths}</strong></div><div><span>Componente internacional</span><strong>{air.internationalShare.toFixed(1)}%</strong></div><p>Use el calendario para programar personal, inventario, horarios extendidos, campañas y coordinación con eventos; no como una estimación directa de ventas.</p></div>
      </div>
      <div className="planning-table"><div className="planning-table__head"><span>Mes</span><span>Aéreo</span><span>Var. anual</span><span>Cruceros</span><span>Entradas extranjeras</span><span>Presión</span></div>{planningCalendar.map((m) => <div className="planning-table__row" key={m.period}><strong>{monthName(m.period)}</strong><span>{integer.format(m.air)}</span><span className={m.airYoy >= 0 ? 'positive' : 'negative'}>{pct(m.airYoy, true)}</span><span>{m.cruise === null ? '—' : integer.format(m.cruise)}</span><span>{m.foreign === null ? '—' : integer.format(m.foreign)}</span><b className={`pressure pressure--${m.pressure.toLowerCase()}`}>{m.pressure}</b></div>)}</div>
    </section> : null}

    {focus === 'markets' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Promoción y segmentación</span><h2>Mercados internacionales prioritarios</h2></div><button onClick={() => onNavigate('markets')}>Abrir módulo completo</button></div>
      <div className="market-analysis-layout"><div className="market-table market-table--shares"><div className="market-table__head"><span>#</span><span>Mercado</span><span>Entradas</span><span>Participación</span></div>{market.countries.slice(0, 10).map((d:any, i:number) => { const share = market.total ? d.valor_entradas / market.total * 100 : 0; return <div className="market-table__row" key={d.pais}><span>{String(i + 1).padStart(2, '0')}</span><strong>{d.pais}</strong><b>{integer.format(d.valor_entradas)}</b><div className="share-cell"><span>{share.toFixed(1)}%</span><i style={{width:`${share}%`}}/></div></div>; })}</div><aside className="analysis-notes"><h3>Riesgo de concentración</h3><strong className="big-stat">{market.top2Share.toFixed(1)}%</strong><p>de las entradas extranjeras se concentra en los dos mercados principales. El HHI calculado con la distribución disponible es {market.hhi.toFixed(0)}, consistente con una concentración muy alta.</p><dl><div><dt>Mercado líder</dt><dd>{market.leader?.pais ?? '—'}</dd></div><div><dt>Segundo</dt><dd>{market.second?.pais ?? '—'}</dd></div><div><dt>Top 5</dt><dd>{market.top5Share.toFixed(1)}%</dd></div></dl></aside></div>
    </section> : null}

    {focus === 'access' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Accesibilidad regional</span><h2>Corredores carreteros de mayor intensidad</h2></div><button onClick={() => onNavigate('mobility')}>Abrir movilidad</button></div>
      <div className="road-browser"><div className="road-browser__head"><span>Estación</span><span>Carretera</span><span>TDPA</span><span>Vs. mediana</span></div>{road.roads.map((d:any) => <div className="road-browser__row" key={`${d.estacion}-${d.tdpa}`}><strong>{d.estacion}</strong><span>{d.carretera}</span><b>{integer.format(d.tdpa)}</b><span>{road.median ? `${(d.tdpa / road.median).toFixed(1)}×` : '—'}</span></div>)}</div>
      <p className="section-caption">TDPA mide tránsito vehicular promedio diario. Es contexto de accesibilidad y logística; no representa turistas únicos ni gasto.</p>
    </section> : null}
  </section>;
}
