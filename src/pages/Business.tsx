import { Anchor, ArrowRight, Building2, CalendarDays, CarFront, Download, Globe2, Lightbulb, Plane } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, busiestRoads, cruises, data } from '../data/model';
import { integer, pct } from '../lib/format';
import { downloadObservatoryCsv, type ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

export function Business({ year, viewMode, compare, onNavigate }: Props) {
  const currentAir = airport.filter((d: any) => d.periodo.startsWith(String(year)));
  const previousAir = airport.filter((d: any) => d.periodo.startsWith(String(year - 1))).slice(0, currentAir.length);
  let running = 0;
  let runningPrev = 0;
  const airChart = currentAir.map((d: any, i: number) => {
    running += d.pasajeros_totales_mes_actual;
    const prev = previousAir[i];
    if (prev) runningPrev += prev.pasajeros_totales_mes_actual;
    return { label: d.label, current: viewMode === 'monthly' ? d.pasajeros_totales_mes_actual : running, previous: prev ? (viewMode === 'monthly' ? prev.pasajeros_totales_mes_actual : runningPrev) : null };
  });

  const airYtd = currentAir.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const prevAirYtd = previousAir.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const airYoy = prevAirYtd ? ((airYtd / prevAirYtd) - 1) * 100 : currentAir.at(-1)?.yoy_total_pct ?? 0;
  const cruiseYear = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestCruise = cruiseYear.at(-1);
  const sameCruisePrev = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = latestCruise && sameCruisePrev ? ((latestCruise.pasajeros_acumulado_actual / sameCruisePrev.pasajeros_acumulado_actual) - 1) * 100 : null;
  const countries = data.nationality.countries.filter((d: any) => Number(d.anio) === year).sort((a: any, b: any) => b.valor_entradas - a.valor_entradas);
  const foreignTotal = countries.reduce((s: number, d: any) => s + d.valor_entradas, 0);
  const topTwoShare = foreignTotal ? countries.slice(0, 2).reduce((s: number, d: any) => s + d.valor_entradas, 0) / foreignTotal * 100 : 0;
  const peakMonths = [...currentAir].sort((a: any, b: any) => b.pasajeros_totales_mes_actual - a.pasajeros_totales_mes_actual).slice(0, 3);
  const weakMonths = [...currentAir].sort((a: any, b: any) => a.pasajeros_totales_mes_actual - b.pasajeros_totales_mes_actual).slice(0, 3);

  return <>
    <header className="page-intro">
      <div><span className="page-kicker">COMERCIO Y SERVICIOS</span><h1>Inteligencia para cámaras empresariales</h1><p>Demanda, mercados, estacionalidad y accesibilidad organizados como una mesa de análisis. La intención es apoyar calendario comercial, promoción y coordinación sectorial.</p></div>
      <div className="page-intro__actions"><button onClick={() => onNavigate('insights')}><Lightbulb size={15}/> Hallazgos</button><button onClick={() => onNavigate('markets')}><Globe2 size={15}/> Mercados</button><button onClick={() => downloadObservatoryCsv(year)}><Download size={15}/> CSV</button></div>
    </header>

    <dl className="stat-strip">
      <div><dt><Plane size={15}/> Llegada aérea</dt><dd>{integer.format(airYtd)}</dd><span className={airYoy >= 0 ? 'positive' : 'negative'}>{compare ? pct(airYoy, true) : year}</span></div>
      <div><dt><Anchor size={15}/> Cruceros</dt><dd>{latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'}</dd><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : cruiseYoy !== null ? 'negative' : ''}>{compare && cruiseYoy !== null ? pct(cruiseYoy, true) : 'último corte'}</span></div>
      <div><dt><Globe2 size={15}/> Entradas extranjeras</dt><dd>{integer.format(foreignTotal)}</dd><span>UPM / DataTur</span></div>
      <div><dt><Building2 size={15}/> Concentración top 2</dt><dd>{topTwoShare.toFixed(1)}%</dd><span>principales mercados</span></div>
    </dl>

    <details className="analysis-section" open>
      <summary><div><span>01</span><strong>Actividad y estacionalidad</strong><small>Ritmo de demanda aérea para calendarización comercial</small></div></summary>
      <div className="analysis-section__body analysis-grid">
        <div className="analysis-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={airChart} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d7ddd9"/><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#626d68' }} tickLine={false} axisLine={false}/><YAxis tick={{ fontSize: 11, fill: '#626d68' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare && previousAir.length ? <Bar dataKey="previous" name={`${year - 1}`} fill="#c7ceca"/> : null}<Bar dataKey="current" name={`${year}`} fill="#0f6b5c"/></BarChart></ResponsiveContainer></ChartFrame></div>
        <aside className="analysis-notes"><h3>Lectura comercial</h3><p>{airYoy >= 0 ? 'La conectividad del tramo comparable crece.' : 'El acumulado sigue debajo del año previo.'} La decisión útil no es “hay más o menos turistas”, sino identificar cuándo cambia la intensidad del flujo.</p><button onClick={() => onNavigate('airport')}>Abrir conectividad <ArrowRight size={13}/></button></aside>
      </div>
      <div className="two-column-list">
        <section><h3>Meses de mayor intensidad</h3>{peakMonths.map((d:any,i:number)=><div className="rank-row" key={d.periodo}><span>{i+1}</span><strong>{d.label}</strong><b>{integer.format(d.pasajeros_totales_mes_actual)}</b><small>{pct(d.yoy_total_pct, true)}</small></div>)}</section>
        <section><h3>Meses de menor intensidad</h3>{weakMonths.map((d:any,i:number)=><div className="rank-row" key={d.periodo}><span>{i+1}</span><strong>{d.label}</strong><b>{integer.format(d.pasajeros_totales_mes_actual)}</b><small>{pct(d.yoy_total_pct, true)}</small></div>)}</section>
      </div>
    </details>

    <details className="analysis-section" open>
      <summary><div><span>02</span><strong>Mercados prioritarios</strong><small>Origen internacional y concentración</small></div><button className="summary-action" onClick={(e) => { e.preventDefault(); onNavigate('markets'); }}>Explorar mercados</button></summary>
      <div className="analysis-section__body">
        <div className="market-table"><div className="market-table__head"><span>Pos.</span><span>País</span><span>Entradas</span><span>Participación relativa</span></div>{countries.slice(0,10).map((d:any,i:number)=><div className="market-table__row" key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><strong>{d.pais}</strong><b>{integer.format(d.valor_entradas)}</b><div className="market-meter"><i style={{width:`${Math.max(3,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div></div>)}</div>
        <p className="section-caption">Los dos principales mercados concentran {topTwoShare.toFixed(1)}% de las entradas registradas en {year}. Es una señal útil para promoción y también una exposición a pocos mercados.</p>
      </div>
    </details>

    <details className="analysis-section">
      <summary><div><span>03</span><strong>Accesibilidad terrestre</strong><small>Aforos SICT vinculados con Mazatlán</small></div><button className="summary-action" onClick={(e) => { e.preventDefault(); onNavigate('mobility'); }}>Ver movilidad</button></summary>
      <div className="analysis-section__body"><div className="plain-table"><div className="plain-table__head"><span>Estación</span><span>Carretera</span><span>TDPA</span></div>{busiestRoads.slice(0,8).map((d:any)=><div className="plain-table__row" key={`${d.estacion}-${d.tdpa}`}><strong>{d.estacion}</strong><span>{d.carretera}</span><b>{integer.format(d.tdpa)}</b></div>)}</div><p className="section-caption"><CarFront size={14}/> Los aforos aproximan intensidad de movilidad y logística; no cuentan turistas.</p></div>
    </details>

    <details className="analysis-section">
      <summary><div><span>04</span><strong>Aplicaciones para cámaras empresariales</strong><small>Preguntas que la plataforma ya puede responder</small></div></summary>
      <div className="analysis-section__body"><div className="question-list"><div><CalendarDays size={15}/><strong>¿Cuándo aumenta la presión de demanda?</strong><p>Use los meses de mayor intensidad para coordinar horarios, inventario, promoción y personal.</p></div><div><Globe2 size={15}/><strong>¿Qué mercados requieren promoción específica?</strong><p>Use el ranking internacional y su concentración para priorizar campañas y alianzas.</p></div><div><CarFront size={15}/><strong>¿Qué corredores importan para accesibilidad?</strong><p>Use TDPA como contexto de movilidad regional y abastecimiento.</p></div></div></div>
    </details>
  </>;
}
