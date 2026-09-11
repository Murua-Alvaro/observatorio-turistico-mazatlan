import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
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

type Display = 'chart' | 'table' | 'reading';
type Series = 'airport' | 'hotel' | 'cruises' | 'markets';

export function Panorama({ year, viewMode, compare, onOpenAirport, onOpenBusiness, onOpenHotel, onOpenInsights }: Props) {
  const [display, setDisplay] = useState<Display>('chart');
  const [series, setSeries] = useState<Series>('airport');

  const currentAir = airport.filter((d: any) => d.periodo.startsWith(String(year)));
  const previousAir = airport.filter((d: any) => d.periodo.startsWith(String(year - 1))).slice(0, currentAir.length);
  let running = 0;
  let runningPrev = 0;
  const airChart = currentAir.map((d: any, i: number) => {
    running += d.pasajeros_totales_mes_actual;
    const prev = previousAir[i];
    if (prev) runningPrev += prev.pasajeros_totales_mes_actual;
    return { ...d, current: viewMode === 'monthly' ? d.pasajeros_totales_mes_actual : running, previous: prev ? (viewMode === 'monthly' ? prev.pasajeros_totales_mes_actual : runningPrev) : null };
  });
  const airYtd = currentAir.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const prevAirYtd = previousAir.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const airYoy = prevAirYtd ? ((airYtd / prevAirYtd) - 1) * 100 : 0;

  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestHotel = hotelYear.at(-1);
  const sameCutHotel = latestHotel ? hotel.find((d: any) => d.periodo === `${year - 1}-${latestHotel.periodo.slice(5)}`) : null;
  const hotelDelta = latestHotel && sameCutHotel ? latestHotel.ocupacion_pct - sameCutHotel.ocupacion_pct : null;

  const cruiseYear = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestCruise = cruiseYear.at(-1);
  const sameCutCruise = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = latestCruise && sameCutCruise ? ((latestCruise.pasajeros_acumulado_actual / sameCutCruise.pasajeros_acumulado_actual) - 1) * 100 : null;

  const marketMonthly = data.nationality.monthly.filter((d: any) => Number(d.anio) === year);
  const foreignEntries = marketMonthly.reduce((s: number, d: any) => s + d.valor_entradas, 0);

  return <section className="dataset-page">
    <header className="dataset-heading">
      <div><span>Panorama general</span><h1>Actividad turística de Mazatlán</h1><p>Seleccione un conjunto de datos y cambie entre gráfica, tabla e interpretación. Las fuentes permanecen separadas porque miden poblaciones distintas.</p></div>
      <div className="dataset-heading__links"><button onClick={onOpenBusiness}>Comercio y servicios</button><button onClick={onOpenHotel}>Hotelería</button><button onClick={onOpenInsights}>Hallazgos</button></div>
    </header>

    <div className="key-figures" role="table" aria-label="Indicadores seleccionados">
      <div className="key-figures__head"><span>Indicador</span><span>Último valor / acumulado</span><span>Comparación</span><span>Fuente</span></div>
      <div className="key-figures__row"><strong>Pasajeros aéreos</strong><b>{integer.format(airYtd)}</b><span className={airYoy >= 0 ? 'positive' : 'negative'}>{compare ? pct(airYoy, true) : '—'}</span><span>OMA</span></div>
      <div className="key-figures__row"><strong>Ocupación hotelera</strong><b>{latestHotel ? `${latestHotel.ocupacion_pct}%` : '—'}</b><span className={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : 'negative'}>{compare && hotelDelta !== null ? pp(hotelDelta) : '—'}</span><span>DataTur</span></div>
      <div className="key-figures__row"><strong>Pasajeros de crucero</strong><b>{latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'}</b><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : 'negative'}>{compare && cruiseYoy !== null ? pct(cruiseYoy, true) : '—'}</span><span>DataTur / SEMAR</span></div>
      <div className="key-figures__row"><strong>Entradas extranjeras</strong><b>{integer.format(foreignEntries)}</b><span>Acumulado disponible</span><span>UPM / DataTur</span></div>
    </div>

    <section className="data-browser">
      <div className="data-browser__controls">
        <label><span>Serie</span><select value={series} onChange={(e) => setSeries(e.target.value as Series)}><option value="airport">Pasajeros aéreos</option><option value="hotel">Ocupación hotelera</option><option value="cruises">Cruceros</option><option value="markets">Entradas extranjeras</option></select></label>
        <div className="display-tabs" role="tablist"><button className={display === 'chart' ? 'active' : ''} onClick={() => setDisplay('chart')}>Gráfica</button><button className={display === 'table' ? 'active' : ''} onClick={() => setDisplay('table')}>Tabla</button><button className={display === 'reading' ? 'active' : ''} onClick={() => setDisplay('reading')}>Interpretación</button></div>
        <span className="data-browser__source">{series === 'airport' ? data.meta.coverage.airport : series === 'hotel' ? data.meta.coverage.hotelMonthly : series === 'cruises' ? data.meta.coverage.cruises : data.meta.coverage.nationality}</span>
      </div>

      <div className="data-browser__display">
        {display === 'chart' && series === 'airport' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={airChart} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare ? <Area type="monotone" dataKey="previous" name={`${year-1}`} stroke="#87929b" strokeDasharray="5 4" fill="transparent"/> : null}<Area type="monotone" dataKey="current" name={`${year}`} stroke="#1769aa" strokeWidth={2.5} fill="#e7f0f8"/></AreaChart></ResponsiveContainer></ChartFrame> : null}
        {display === 'chart' && series === 'hotel' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#1769aa" strokeWidth={2.5} dot={{r:2}}/></LineChart></ResponsiveContainer></ChartFrame> : null}
        {display === 'chart' && series === 'cruises' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={cruiseYear} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Bar dataKey="pasajeros_mes_actual" name="Pasajeros" fill="#1769aa"/></BarChart></ResponsiveContainer></ChartFrame> : null}
        {display === 'chart' && series === 'markets' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={marketMonthly} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="fecha" tickFormatter={(v:any)=>String(v).slice(5,7)} tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="valor_entradas" name="Entradas" stroke="#1769aa" strokeWidth={2.5} fill="#e7f0f8"/></AreaChart></ResponsiveContainer></ChartFrame> : null}

        {display === 'table' ? <div className="table-wrap explorer-table"><table><thead><tr>{series === 'airport' ? <><th>Periodo</th><th>Total</th><th>Nacional</th><th>Internacional</th><th>Var. anual</th></> : series === 'hotel' ? <><th>Periodo</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th></> : series === 'cruises' ? <><th>Periodo</th><th>Pasajeros mes</th><th>Acumulado</th><th>Arribos acum.</th></> : <><th>Periodo</th><th>Entradas</th></>}</tr></thead><tbody>
          {series === 'airport' ? currentAir.map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.pasajeros_totales_mes_actual)}</td><td>{integer.format(d.pasajeros_nacionales_mes_actual)}</td><td>{integer.format(d.pasajeros_internacionales_mes_actual)}</td><td className={d.yoy_total_pct >= 0 ? 'positive' : 'negative'}>{pct(d.yoy_total_pct,true)}</td></tr>) : null}
          {series === 'hotel' ? hotelYear.map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td></tr>) : null}
          {series === 'cruises' ? cruiseYear.map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.pasajeros_mes_actual)}</td><td>{integer.format(d.pasajeros_acumulado_actual)}</td><td>{integer.format(d.arribos_acumulado_actual)}</td></tr>) : null}
          {series === 'markets' ? marketMonthly.map((d:any)=><tr key={d.fecha}><td>{d.fecha.slice(0,7)}</td><td>{integer.format(d.valor_entradas)}</td></tr>) : null}
        </tbody></table></div> : null}

        {display === 'reading' ? <div className="reading-pane"><h2>{series === 'airport' ? 'Conectividad aérea' : series === 'hotel' ? 'Hotelería formal' : series === 'cruises' ? 'Turismo marítimo' : 'Mercados internacionales'}</h2><p>{series === 'airport' ? `El acumulado del tramo disponible cambia ${pct(airYoy,true)} frente al año anterior. Pasajeros terminales no equivalen a huéspedes.` : series === 'hotel' ? `El último corte reporta ${latestHotel?.ocupacion_pct ?? '—'}% de ocupación. Los cortes son acumulados al mes y se comparan con el mismo corte.` : series === 'cruises' ? `${latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'} pasajeros acumulados al último corte. El crucerista no debe mezclarse con demanda hotelera.` : `${integer.format(foreignEntries)} entradas extranjeras registradas en el periodo disponible. La nacionalidad sirve para promoción y segmentación.`}</p><dl><div><dt>Unidad</dt><dd>{series === 'hotel' ? 'Porcentaje / cuartos' : series === 'markets' ? 'Entradas registradas' : 'Pasajeros'}</dd></div><div><dt>Fuente</dt><dd>{series === 'airport' ? 'OMA' : series === 'hotel' ? 'DataTur' : series === 'cruises' ? 'DataTur / SEMAR' : 'UPM / DataTur'}</dd></div><div><dt>Uso recomendado</dt><dd>{series === 'hotel' ? 'Seguimiento operativo y de capacidad' : 'Lectura de demanda y estacionalidad'}</dd></div></dl></div> : null}
      </div>
    </section>

    <details className="dataset-disclosure" open><summary>Qué requiere atención ahora</summary><div className="signal-register"><div><span className={airYoy >= 0 ? 'status good' : 'status warn'}>{airYoy >= 0 ? 'Mejora' : 'Atención'}</span><strong>Conectividad aérea</strong><p>{pct(airYoy,true)} en el tramo comparable.</p><button onClick={onOpenAirport}>Abrir serie</button></div><div><span className={hotelDelta !== null && hotelDelta >= 0 ? 'status good' : 'status neutral'}>Hotelería</span><strong>Ocupación al corte</strong><p>{hotelDelta === null ? 'Sin comparación equivalente.' : `${pp(hotelDelta)} frente al mismo corte.`}</p><button onClick={onOpenHotel}>Abrir análisis</button></div><div><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'status good' : 'status neutral'}>Cruceros</span><strong>Flujo marítimo</strong><p>{cruiseYoy === null ? 'Sin comparación equivalente.' : `${pct(cruiseYoy,true)} acumulado.`}</p><button onClick={onOpenInsights}>Ver implicaciones</button></div></div></details>
  </section>;
}
