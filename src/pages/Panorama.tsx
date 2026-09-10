import { Anchor, ArrowRight, BedDouble, Building2, Lightbulb, Plane, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
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
    <header className="page-intro">
      <div><span className="page-kicker">PANORAMA GENERAL</span><h1>Actividad turística de Mazatlán</h1><p>Una lectura ejecutiva de conectividad, alojamiento, cruceros y mercados. Cada fuente mantiene su propia escala para evitar sumar poblaciones que no son equivalentes.</p></div>
      <div className="page-intro__actions"><button onClick={onOpenBusiness}><Building2 size={15}/> Comercio</button><button onClick={onOpenHotel}><BedDouble size={15}/> Hotelería</button><button onClick={onOpenInsights}><Lightbulb size={15}/> Hallazgos</button></div>
    </header>

    <dl className="stat-strip">
      <div><dt><Plane size={15}/> Pasajeros aéreos</dt><dd>{integer.format(airYtd)}</dd><span className={airYoy >= 0 ? 'positive' : 'negative'}>{compare ? pct(airYoy, true) : `Año ${year}`}</span></div>
      <div><dt><BedDouble size={15}/> Ocupación hotelera</dt><dd>{latestHotel ? `${latestHotel.ocupacion_pct}%` : '—'}</dd><span className={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : hotelDelta !== null ? 'negative' : ''}>{compare && hotelDelta !== null ? pp(hotelDelta) : latestHotel?.periodo ?? '—'}</span></div>
      <div><dt><Anchor size={15}/> Cruceros</dt><dd>{latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'}</dd><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : cruiseYoy !== null ? 'negative' : ''}>{compare && cruiseYoy !== null ? pct(cruiseYoy, true) : latestCruise?.periodo ?? '—'}</span></div>
      <div><dt><Users size={15}/> Entradas extranjeras</dt><dd>{integer.format(foreignEntries)}</dd><span>UPM / DataTur · {year}</span></div>
    </dl>

    <details className="analysis-section" open>
      <summary><div><span>01</span><strong>Señales para decisión</strong><small>Qué cambió y qué requiere atención</small></div></summary>
      <div className="analysis-section__body">
        <div className="signal-table">
          <div><span className={airYoy >= 0 ? 'signal-status good' : 'signal-status alert'}>{airYoy >= 0 ? 'Mejora' : 'Atención'}</span><strong>Conectividad aérea</strong><p>{pct(airYoy, true)} frente al tramo comparable. El acumulado y el último mes deben leerse por separado.</p><button onClick={onOpenAirport}>Abrir aeropuerto <ArrowRight size={13}/></button></div>
          <div><span className={hotelDelta !== null && hotelDelta >= 0 ? 'signal-status good' : 'signal-status neutral'}>{hotelDelta !== null && hotelDelta >= 0 ? 'Mejora' : 'Seguimiento'}</span><strong>Hotelería</strong><p>{hotelDelta === null ? 'No hay corte comparable previo.' : `${pp(hotelDelta)} en ocupación frente al mismo corte.`}</p><button onClick={onOpenHotel}>Abrir hotelería <ArrowRight size={13}/></button></div>
          <div><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'signal-status good' : 'signal-status neutral'}>{cruiseYoy !== null && cruiseYoy >= 0 ? 'Expansión' : 'Seguimiento'}</span><strong>Cruceros</strong><p>{cruiseYoy === null ? 'Sin comparación equivalente.' : `${pct(cruiseYoy, true)} en pasajeros acumulados al corte.`}</p><button onClick={onOpenInsights}>Ver implicaciones <ArrowRight size={13}/></button></div>
        </div>
      </div>
    </details>

    <details className="analysis-section" open>
      <summary><div><span>02</span><strong>Conectividad aérea</strong><small>{viewMode === 'monthly' ? 'Serie mensual' : 'Serie acumulada'} · OMA</small></div><button className="summary-action" onClick={(e) => { e.preventDefault(); onOpenAirport(); }}>Ver módulo</button></summary>
      <div className="analysis-section__body analysis-grid">
        <div className="analysis-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={airChart} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d7ddd9"/><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#626d68' }} tickLine={false} axisLine={false}/><YAxis tick={{ fontSize: 11, fill: '#626d68' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare && previousAir.length ? <Area type="monotone" dataKey="previous" name={`${year - 1}`} stroke="#9ca6a1" strokeWidth={1.4} fill="transparent" strokeDasharray="5 4"/> : null}<Area type="monotone" dataKey="current" name={`${year}`} stroke="#0f6b5c" strokeWidth={2.4} fill="#dce9e5"/></AreaChart></ResponsiveContainer></ChartFrame></div>
        <aside className="analysis-notes"><h3>Cómo leerlo</h3><p>Esta serie muestra pasajeros terminales, no turistas alojados. Es útil para medir intensidad de conectividad y cambios de corto plazo.</p><dl><div><dt>Fuente</dt><dd>OMA</dd></div><div><dt>Cobertura</dt><dd>{data.meta.coverage.airport}</dd></div><div><dt>Comparación</dt><dd>{compare ? `${year} vs ${year - 1}` : 'Desactivada'}</dd></div></dl></aside>
      </div>
    </details>

    <details className="analysis-section">
      <summary><div><span>03</span><strong>Hotelería formal</strong><small>Cortes acumulados al mes · DataTur</small></div></summary>
      <div className="analysis-section__body analysis-grid">
        <div className="analysis-chart"><ChartFrame><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d7ddd9"/><XAxis dataKey="label" tick={{ fontSize: 10, fill: '#626d68' }} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tick={{ fontSize: 10, fill: '#626d68' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${v}%`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#2d5e88" strokeWidth={2.2} dot={false}/></LineChart></ResponsiveContainer></ChartFrame><SourceNote source="Regla" note="Cada punto corresponde a un corte acumulado; no es una tasa mensual independiente." /></div>
        <aside className="analysis-notes"><h3>Pregunta que responde</h3><p>¿Cómo evoluciona el desempeño hotelero cuando se compara el mismo corte del año anterior?</p><button onClick={onOpenHotel}>Abrir análisis hotelero <ArrowRight size={13}/></button></aside>
      </div>
    </details>
  </>;
}
