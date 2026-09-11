import { useState } from 'react';
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

type Analysis = 'seasonality' | 'markets' | 'mobility';
type Display = 'chart' | 'table' | 'reading';

export function Business({ year, viewMode, compare, onNavigate }: Props) {
  const [analysis, setAnalysis] = useState<Analysis>('seasonality');
  const [display, setDisplay] = useState<Display>('chart');

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

  const cruiseYear = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latestCruise = cruiseYear.at(-1);
  const sameCruisePrev = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = latestCruise && sameCruisePrev ? ((latestCruise.pasajeros_acumulado_actual / sameCruisePrev.pasajeros_acumulado_actual) - 1) * 100 : null;

  const countries = data.nationality.countries.filter((d: any) => Number(d.anio) === year).sort((a: any, b: any) => b.valor_entradas - a.valor_entradas);
  const foreignTotal = countries.reduce((s: number, d: any) => s + d.valor_entradas, 0);
  const topTwoShare = foreignTotal ? countries.slice(0, 2).reduce((s: number, d: any) => s + d.valor_entradas, 0) / foreignTotal * 100 : 0;
  const peakMonths = [...currentAir].sort((a: any, b: any) => b.pasajeros_totales_mes_actual - a.pasajeros_totales_mes_actual).slice(0, 3);

  return <section className="dataset-page">
    <header className="dataset-heading">
      <div><span>Sector / comercio y servicios</span><h1>Demanda turística para decisión empresarial</h1><p>La vista está organizada por pregunta de negocio: estacionalidad, mercados de origen o accesibilidad. Cambie el análisis desde el desplegable.</p></div>
      <div className="dataset-heading__links"><button onClick={() => onNavigate('insights')}>Hallazgos</button><button onClick={() => onNavigate('markets')}>Mercados</button><button onClick={() => downloadObservatoryCsv(year)}>Descargar CSV</button></div>
    </header>

    <div className="key-figures">
      <div className="key-figures__head"><span>Indicador</span><span>Valor</span><span>Comparación</span><span>Uso</span></div>
      <div className="key-figures__row"><strong>Llegada aérea</strong><b>{integer.format(airYtd)}</b><span className={airYoy >= 0 ? 'positive' : 'negative'}>{compare ? pct(airYoy,true) : '—'}</span><span>Ritmo de demanda</span></div>
      <div className="key-figures__row"><strong>Pasajeros de crucero</strong><b>{latestCruise ? integer.format(latestCruise.pasajeros_acumulado_actual) : '—'}</b><span className={cruiseYoy !== null && cruiseYoy >= 0 ? 'positive' : 'negative'}>{compare && cruiseYoy !== null ? pct(cruiseYoy,true) : '—'}</span><span>Consumo de corta estancia</span></div>
      <div className="key-figures__row"><strong>Entradas extranjeras</strong><b>{integer.format(foreignTotal)}</b><span>{topTwoShare.toFixed(1)}% top 2</span><span>Segmentación comercial</span></div>
      <div className="key-figures__row"><strong>Mayor TDPA</strong><b>{integer.format(Math.max(...busiestRoads.map((d:any)=>d.tdpa)))}</b><span>vehículos/día</span><span>Accesibilidad y logística</span></div>
    </div>

    <section className="data-browser">
      <div className="data-browser__controls">
        <label><span>Pregunta</span><select value={analysis} onChange={(e) => setAnalysis(e.target.value as Analysis)}><option value="seasonality">¿Cuándo aumenta la demanda?</option><option value="markets">¿De dónde viene el mercado?</option><option value="mobility">¿Qué corredores concentran flujo?</option></select></label>
        <div className="display-tabs"><button className={display === 'chart' ? 'active' : ''} onClick={() => setDisplay('chart')}>Gráfica</button><button className={display === 'table' ? 'active' : ''} onClick={() => setDisplay('table')}>Tabla</button><button className={display === 'reading' ? 'active' : ''} onClick={() => setDisplay('reading')}>Interpretación</button></div>
        <span className="data-browser__source">{analysis === 'seasonality' ? 'OMA' : analysis === 'markets' ? 'UPM / DataTur' : 'SICT'}</span>
      </div>

      <div className="data-browser__display">
        {display === 'chart' && analysis === 'seasonality' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={airChart} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>{compare ? <Bar dataKey="previous" name={`${year-1}`} fill="#b9c2ca"/> : null}<Bar dataKey="current" name={`${year}`} fill="#1769aa"/></BarChart></ResponsiveContainer></ChartFrame> : null}

        {display === 'chart' && analysis === 'markets' ? <div className="horizontal-ranking">{countries.slice(0,10).map((d:any,i:number)=><div key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><strong>{d.pais}</strong><div className="horizontal-ranking__bar"><i style={{width:`${Math.max(2,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div><b>{integer.format(d.valor_entradas)}</b></div>)}</div> : null}

        {display === 'chart' && analysis === 'mobility' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={busiestRoads.slice(0,8)} layout="vertical" margin={{top:12,right:20,left:30,bottom:0}}><CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="#d8dee3"/><XAxis type="number" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis type="category" dataKey="estacion" width={160} tick={{fontSize:10,fill:'#5b6770'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Bar dataKey="tdpa" name="TDPA" fill="#1769aa"/></BarChart></ResponsiveContainer></ChartFrame> : null}

        {display === 'table' ? <div className="table-wrap explorer-table"><table><thead><tr>{analysis === 'seasonality' ? <><th>Periodo</th><th>Pasajeros</th><th>Var. anual</th></> : analysis === 'markets' ? <><th>Pos.</th><th>País</th><th>Entradas</th><th>Participación relativa</th></> : <><th>Estación</th><th>Carretera</th><th>TDPA</th></>}</tr></thead><tbody>{analysis === 'seasonality' ? currentAir.map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.pasajeros_totales_mes_actual)}</td><td className={d.yoy_total_pct>=0?'positive':'negative'}>{pct(d.yoy_total_pct,true)}</td></tr>) : analysis === 'markets' ? countries.slice(0,15).map((d:any,i:number)=><tr key={d.pais}><td>{i+1}</td><td>{d.pais}</td><td>{integer.format(d.valor_entradas)}</td><td>{foreignTotal ? `${(d.valor_entradas/foreignTotal*100).toFixed(1)}%` : '—'}</td></tr>) : busiestRoads.map((d:any)=><tr key={`${d.estacion}-${d.tdpa}`}><td>{d.estacion}</td><td>{d.carretera}</td><td>{integer.format(d.tdpa)}</td></tr>)}</tbody></table></div> : null}

        {display === 'reading' ? <div className="reading-pane"><h2>{analysis === 'seasonality' ? 'Lectura de estacionalidad' : analysis === 'markets' ? 'Lectura de mercados' : 'Lectura de accesibilidad'}</h2><p>{analysis === 'seasonality' ? `El tramo disponible cambia ${pct(airYoy,true)} frente al año anterior. Los meses de mayor intensidad son ${peakMonths.map((d:any)=>d.label).join(', ')}. Úselo para calendarizar promociones, inventario y personal; no equivale a ventas observadas.` : analysis === 'markets' ? `Los dos principales mercados representan ${topTwoShare.toFixed(1)}% de las entradas extranjeras registradas. La concentración facilita segmentación, pero también expone al destino a pocos mercados.` : 'Los aforos SICT son contexto de movilidad y logística. No cuentan turistas y no deben sumarse con aeropuerto o cruceros.'}</p><dl><div><dt>Decisión apoyada</dt><dd>{analysis === 'seasonality' ? 'Calendario comercial' : analysis === 'markets' ? 'Promoción por mercado' : 'Logística y accesibilidad'}</dd></div><div><dt>Fuente</dt><dd>{analysis === 'seasonality' ? 'OMA' : analysis === 'markets' ? 'UPM / DataTur' : 'SICT'}</dd></div></dl></div> : null}
      </div>
    </section>

    <details className="dataset-disclosure" open><summary>Aplicaciones para cámaras empresariales</summary><div className="application-list"><div><strong>Planeación de temporada</strong><p>Sincronizar horarios, inventario y campañas con los meses de mayor intensidad.</p></div><div><strong>Promoción por mercado</strong><p>Priorizar países por volumen y concentración de entradas.</p></div><div><strong>Seguimiento de accesibilidad</strong><p>Usar TDPA como contexto de flujo regional y abastecimiento.</p></div></div></details>
  </section>;
}
