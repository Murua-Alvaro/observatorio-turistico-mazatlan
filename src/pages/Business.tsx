import { Anchor, ArrowRight, Building2, CalendarDays, CarFront, Download, Globe2, Lightbulb, Plane } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
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
  const weakMonths = [...currentAir].sort((a: any, b: any) => a.pasajeros_totales_mes_actual - b.pasajeros_totales_mes_actual).slice(0, 2);

  return <>
    <SectionHeader kicker="Inteligencia empresarial" title="Una mesa de decisión para cámaras, comercio y servicios" description="No sólo muestra datos: ordena señales por demanda, mercado, estacionalidad y accesibilidad para apoyar calendario comercial, promoción y coordinación empresarial." />

    <div className="action-strip">
      <button onClick={() => onNavigate('insights')}><Lightbulb size={15}/><span>Hallazgos</span><small>riesgos y oportunidades</small></button>
      <button onClick={() => onNavigate('markets')}><Globe2 size={15}/><span>Mercados</span><small>origen internacional</small></button>
      <button onClick={() => onNavigate('mobility')}><CarFront size={15}/><span>Accesibilidad</span><small>aforos carreteros</small></button>
      <button onClick={() => downloadObservatoryCsv(year)}><Download size={15}/><span>Exportar datos</span><small>CSV consolidado {year}</small></button>
    </div>

    <div className="metric-grid">
      <Metric eyebrow={`Llegada aérea ${year}`} value={integer.format(airYtd)} change={compare ? pct(airYoy, true) : undefined} changeTone={airYoy >= 0 ? 'positive' : 'negative'} detail="pasajeros terminales · OMA" icon={<Plane size={18}/>} />
      <Metric eyebrow="Cruceros al último corte" value={latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'} change={compare && cruiseYoy !== null ? pct(cruiseYoy, true) : undefined} changeTone={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : 'negative'} detail="pasajeros · DataTur / SEMAR" icon={<Anchor size={18}/>} />
      <Metric eyebrow="Entradas extranjeras" value={integer.format(foreignTotal)} detail={`registros ${year} · UPM/DataTur`} icon={<Globe2 size={18}/>} />
      <Metric eyebrow="Concentración top 2" value={`${topTwoShare.toFixed(1)}%`} detail="participación de los dos principales mercados" icon={<Building2 size={18}/>} />
    </div>

    <div className="executive-grid">
      <Panel title={`Ritmo de demanda aérea · ${year}`} subtitle={`${viewMode === 'monthly' ? 'Intensidad mensual' : 'Acumulado progresivo'} para calendarización comercial`}>
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={airChart} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66716c' }} tickLine={false} axisLine={false}/><YAxis tick={{ fontSize: 11, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare && previousAir.length ? <Bar dataKey="previous" name={`${year - 1}`} fill="#c9cfcb" radius={[5,5,0,0]}/> : null}<Bar dataKey="current" name={`${year}`} fill="#1b7466" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></ChartFrame>
      </Panel>

      <section className="decision-board">
        <div className="decision-board__eyebrow">Lectura para decisión</div><h3>Qué debería discutir una cámara empresarial</h3>
        <article><span className="decision-index">01</span><div><strong>{airYoy >= 0 ? 'La conectividad está creciendo.' : 'La conectividad acumulada sigue debajo del año previo.'}</strong><p>{pct(airYoy, true)} en el tramo comparable. Use el último mes y el acumulado para no confundir recuperación reciente con tendencia anual.</p></div></article>
        <article><span className="decision-index">02</span><div><strong>Los mercados internacionales están concentrados.</strong><p>Los dos principales países representan {topTwoShare.toFixed(1)}% del flujo extranjero registrado. Eso facilita segmentación, pero eleva dependencia.</p></div></article>
        <article><span className="decision-index">03</span><div><strong>Los cruceros requieren una estrategia comercial propia.</strong><p>{latestCruise ? `${integer.format(latestCruise.pasajeros_acumulado_actual)} pasajeros acumulados al corte.` : 'Sin datos disponibles.'} Es consumo potencial de corta estancia, no demanda hotelera.</p></div></article>
        <button className="decision-board__action" onClick={() => onNavigate('insights')}>Abrir centro de hallazgos <ArrowRight size={14}/></button>
      </section>
    </div>

    <div className="split-grid">
      <Panel title="Ventanas de mayor intensidad" subtitle="Meses con más pasajeros aéreos dentro del año seleccionado"><div className="priority-list">{peakMonths.map((d:any,i:number)=><article key={d.periodo}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{d.label}</strong><small>{integer.format(d.pasajeros_totales_mes_actual)} pasajeros</small></div><b>{pct(d.yoy_total_pct, true)}</b></article>)}</div><div className="micro-note"><CalendarDays size={15}/><span>Úselo para planear inventarios, horarios, personal y campañas; no equivale a ventas observadas.</span></div></Panel>
      <Panel title="Ventanas de menor intensidad" subtitle="Meses que requieren otra estrategia comercial"><div className="priority-list priority-list--weak">{weakMonths.map((d:any,i:number)=><article key={d.periodo}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{d.label}</strong><small>{integer.format(d.pasajeros_totales_mes_actual)} pasajeros</small></div><b>{pct(d.yoy_total_pct, true)}</b></article>)}</div><div className="micro-note"><Building2 size={15}/><span>Una ventana débil puede ser útil para promociones, eventos, paquetes y campañas de demanda inducida.</span></div></Panel>
    </div>

    <div className="split-grid">
      <Panel title={`Mercados internacionales prioritarios · ${year}`} subtitle="Ranking por entradas registradas"><div className="ranking ranking--clean">{countries.slice(0,8).map((d:any,i:number)=><div className="rank" key={d.pais}><span className="rank__number">{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><span>{integer.format(d.valor_entradas)} entradas</span></div><div className="rank__bar"><span style={{width:`${Math.max(4,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div></div>)}</div><button className="panel-link" onClick={() => onNavigate('markets')}>Explorar mercados <ArrowRight size={14}/></button></Panel>
      <Panel title="Accesibilidad terrestre" subtitle="Estaciones SICT con mayor tránsito diario promedio"><div className="road-list">{busiestRoads.slice(0,5).map((d:any)=><article key={`${d.estacion}-${d.tdpa}`}><div><strong>{d.estacion}</strong><small>{d.carretera}</small></div><b>{integer.format(d.tdpa)}</b><span>TDPA</span></article>)}</div><button className="panel-link" onClick={() => onNavigate('mobility')}>Ver movilidad <ArrowRight size={14}/></button></Panel>
    </div>
  </>;
}
