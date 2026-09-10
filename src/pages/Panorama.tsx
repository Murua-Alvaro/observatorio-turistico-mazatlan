import type { ReactNode } from 'react';
import { Anchor, ArrowUpRight, BedDouble, Building2, ChevronRight, Lightbulb, Plane, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SourceNote } from '../components/SourceNote';
import { airport, cruises, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onOpenAirport: () => void;
  onOpenBusiness: () => void;
  onOpenHotel: () => void;
  onOpenInsights: () => void;
};

export function Panorama({ year, viewMode, compare, onOpenAirport, onOpenBusiness, onOpenHotel, onOpenInsights }: Props) {
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

  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestHotel = hotelYear.at(-1);
  const sameCutHotel = latestHotel ? hotel.find((d: any) => d.periodo === `${year - 1}-${latestHotel.periodo.slice(5)}`) : null;
  const hotelDelta = latestHotel && sameCutHotel ? latestHotel.ocupacion_pct - sameCutHotel.ocupacion_pct : null;

  const cruisesYear = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestCruise = cruisesYear.at(-1);
  const sameCutCruise = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = latestCruise && sameCutCruise ? ((latestCruise.pasajeros_acumulado_actual / sameCutCruise.pasajeros_acumulado_actual) - 1) * 100 : null;

  const foreignEntries = data.nationality.monthly.filter((d: any) => Number(d.anio) === year).reduce((s: number, d: any) => s + d.valor_entradas, 0);

  return <>
    <section className="executive-hero">
      <div className="executive-hero__copy">
        <span className="eyebrow">Mazatlán · inteligencia turística · {year}</span>
        <h1>Información para decidir <em>cuándo actuar</em>, no sólo para mirar gráficas.</h1>
        <p>El portal separa conectividad, alojamiento, cruceros, mercados y movilidad; después los convierte en señales operativas para cámaras empresariales y hoteles.</p>
        <div className="executive-hero__actions">
          <button className="primary-action" onClick={onOpenBusiness}>Empresas y comercio <ArrowUpRight size={16}/></button>
          <button className="secondary-action" onClick={onOpenHotel}>Sector hotelero <ChevronRight size={16}/></button>
          <button className="secondary-action" onClick={onOpenInsights}>Hallazgos <Lightbulb size={15}/></button>
        </div>
      </div>
      <aside className="brief-card"><span>Brief ejecutivo</span><strong>{airYoy < 0 ? 'La recuperación sigue siendo desigual' : 'La conectividad mejora, pero no todos los canales al mismo ritmo'}</strong><p>Use la comparación interanual para distinguir recuperación reciente de desempeño acumulado y evite sumar fuentes que miden poblaciones distintas.</p><div className="brief-card__meta"><span>Vista activa</span><b>{viewMode === 'monthly' ? 'Mensual' : 'Acumulada'} {compare ? '· comparativa' : ''}</b></div></aside>
    </section>

    <section className="audience-selector">
      <button onClick={onOpenBusiness} className="audience-card"><div className="audience-card__icon"><Building2 size={19}/></div><span>Para cámaras y comercio</span><strong>Demanda, estacionalidad y mercados</strong><p>Calendario de actividad, señales de llegada, mercados prioritarios y accesibilidad.</p><b>Abrir inteligencia empresarial <ArrowUpRight size={14}/></b></button>
      <button onClick={onOpenHotel} className="audience-card audience-card--hotel"><div className="audience-card__icon"><BedDouble size={19}/></div><span>Para hoteles</span><strong>Ocupación, capacidad y presión de demanda</strong><p>Comparación a cortes equivalentes y lectura conjunta con conectividad.</p><b>Abrir inteligencia hotelera <ArrowUpRight size={14}/></b></button>
    </section>

    <div className="metric-grid metric-grid--executive">
      <Metric eyebrow={`Pasajeros terminales ${year}`} value={integer.format(airYtd)} change={compare ? pct(airYoy, true) : undefined} changeTone={airYoy >= 0 ? 'positive' : 'negative'} detail={`enero–${currentAir.at(-1)?.periodo.slice(5) ?? '—'} · OMA`} icon={<Plane size={18}/>} />
      <Metric eyebrow="Ocupación hotelera" value={latestHotel ? `${latestHotel.ocupacion_pct}%` : '—'} change={compare && hotelDelta !== null ? pp(hotelDelta) : undefined} changeTone={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : 'negative'} detail={latestHotel ? `corte ${latestHotel.periodo} · DataTur` : 'sin datos'} icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Pasajeros de crucero" value={latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'} change={compare && cruiseYoy !== null ? pct(cruiseYoy, true) : undefined} changeTone={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : 'negative'} detail={latestCruise ? `acumulado a ${latestCruise.periodo}` : 'sin datos'} icon={<Anchor size={18}/>} />
      <Metric eyebrow="Entradas extranjeras" value={integer.format(foreignEntries)} detail={`registros ${year} · UPM/DataTur`} icon={<Users size={18}/>} />
    </div>

    <div className="executive-grid">
      <Panel title="Pulso de conectividad" subtitle={`${viewMode === 'monthly' ? 'Pasajeros mensuales' : 'Pasajeros acumulados'} · OMA`} action={<button className="text-button" onClick={onOpenAirport}>Abrir módulo <ChevronRight size={14}/></button>}>
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={airChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/><XAxis dataKey="label" tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false}/><YAxis tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare && previousAir.length ? <Area type="monotone" dataKey="previous" name={`${year - 1}`} stroke="#9aa49f" strokeWidth={1.5} fill="transparent" strokeDasharray="5 5"/> : null}<Area type="monotone" dataKey="current" name={`${year}`} stroke="#1b7466" strokeWidth={2.5} fill="#dbeae5"/></AreaChart></ResponsiveContainer></ChartFrame>
      </Panel>
      <section className="signal-console"><div className="signal-console__head"><span>Señales clave</span><button onClick={onOpenInsights}>Ver todas <ArrowUpRight size={13}/></button></div><Signal tone={airYoy >= 0 ? 'good' : 'alert'} title="Conectividad aérea">El acumulado cambia {pct(airYoy, true)} frente al tramo comparable disponible.</Signal><Signal tone={hotelDelta !== null && hotelDelta >= 0 ? 'good' : 'neutral'} title="Hotelería">{hotelDelta === null ? 'No hay corte comparable previo en la base.' : `${pp(hotelDelta)} en ocupación frente al mismo corte.`}</Signal><Signal tone={cruiseYoy !== null && cruiseYoy >= 0 ? 'good' : 'neutral'} title="Cruceros">{cruiseYoy === null ? 'Sin comparación equivalente.' : `${pct(cruiseYoy, true)} en pasajeros acumulados.`}</Signal><Signal title="Mercados">Las entradas extranjeras se analizan por nacionalidad; no equivalen a pasajeros terminales totales.</Signal></section>
    </div>

    <div className="split-grid">
      <Panel title="Hotelería formal" subtitle={`Cortes acumulados de ${year} · DataTur`}><ChartFrame><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/><XAxis dataKey="label" tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${v}%`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#315f8c" strokeWidth={2.4} dot={false}/></LineChart></ResponsiveContainer></ChartFrame><SourceNote source="Lectura correcta" note="Cada punto corresponde a un corte acumulado; no se interpreta como ocupación mensual independiente." /></Panel>
      <section className="editorial-panel"><span className="eyebrow">Cómo usar el portal</span><h3>Primero elija una audiencia; después use los controles superiores.</h3><p>El año, la vista mensual/acumulada y la comparación interanual modifican los módulos donde la fuente lo permite. El botón CSV exporta una tabla consolidada y Reporte abre una versión imprimible.</p><div className="editorial-rule"><span>01</span><p><strong>Compare</strong> años sólo con periodos equivalentes.</p></div><div className="editorial-rule"><span>02</span><p><strong>Exportar</strong> conserva unidad y fuente por indicador.</p></div><div className="editorial-rule"><span>03</span><p><strong>Hallazgos</strong> traduce indicadores a decisiones.</p></div></section>
    </div>
  </>;
}

function Signal({ title, children, tone = 'neutral' }: { title: string; children: ReactNode; tone?: 'alert' | 'good' | 'neutral' }) {
  return <article className="signal-console__item"><span className={`signal-dot signal-dot--${tone}`}/><div><strong>{title}</strong><p>{children}</p></div></article>;
}
