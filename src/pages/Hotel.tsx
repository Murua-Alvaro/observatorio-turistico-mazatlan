import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import { downloadObservatoryCsv, type ObservatoryYear } from '../lib/export';

type Props = {
  year: ObservatoryYear;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

type Analysis = 'occupancy' | 'capacity' | 'demand';
type Display = 'chart' | 'table' | 'reading';

export function Hotel({ year, compare, onNavigate }: Props) {
  const [analysis, setAnalysis] = useState<Analysis>('occupancy');
  const [display, setDisplay] = useState<Display>('chart');

  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const latest = hotelYear.at(-1);
  const first = hotelYear.at(0);
  const sameCutPrev = latest ? hotel.find((d:any) => d.periodo === `${year - 1}-${latest.periodo.slice(5)}`) : null;
  const hotelDelta = latest && sameCutPrev ? latest.ocupacion_pct - sameCutPrev.ocupacion_pct : null;
  const capacityGrowth = latest && first ? ((latest.cuartos_disponibles_promedio_diario / first.cuartos_disponibles_promedio_diario) - 1) * 100 : 0;

  const airYear = airport.filter((d:any) => d.periodo.startsWith(String(year)));
  const airYtd = airYear.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
  const intlYtd = airYear.reduce((s:number,d:any)=>s+d.pasajeros_internacionales_mes_actual,0);
  const countries = data.nationality.countries.filter((d:any)=>Number(d.anio)===year).sort((a:any,b:any)=>b.valor_entradas-a.valor_entradas);
  const foreignTotal = countries.reduce((s:number,d:any)=>s+d.valor_entradas,0);

  return <section className="dataset-page">
    <header className="dataset-heading">
      <div><span>Sector / hotelería</span><h1>Desempeño hotelero y contexto de demanda</h1><p>Seleccione ocupación, capacidad o demanda. Los cortes de DataTur se comparan con el mismo mes del año anterior; no se tratan como tasas mensuales independientes.</p></div>
      <div className="dataset-heading__links"><button onClick={() => onNavigate('markets')}>Mercados</button><button onClick={() => onNavigate('airport')}>Aeropuerto</button><button onClick={() => downloadObservatoryCsv(year)}>Descargar CSV</button></div>
    </header>

    <div className="method-banner"><strong>Regla metodológica</strong><span>Ocupación = corte acumulado al mes. Compare junio con junio, mayo con mayo, etc.</span></div>

    <div className="key-figures">
      <div className="key-figures__head"><span>Indicador</span><span>Valor</span><span>Comparación</span><span>Fuente</span></div>
      <div className="key-figures__row"><strong>Ocupación al corte</strong><b>{latest ? `${latest.ocupacion_pct}%` : '—'}</b><span className={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : 'negative'}>{compare && hotelDelta !== null ? pp(hotelDelta) : '—'}</span><span>DataTur</span></div>
      <div className="key-figures__row"><strong>Cuartos disponibles</strong><b>{latest ? integer.format(latest.cuartos_disponibles_promedio_diario) : '—'}</b><span className={capacityGrowth >= 0 ? 'positive' : 'negative'}>{pct(capacityGrowth,true)}</span><span>DataTur</span></div>
      <div className="key-figures__row"><strong>Cuartos ocupados</strong><b>{latest ? integer.format(latest.cuartos_ocupados) : '—'}</b><span>Último corte</span><span>DataTur</span></div>
      <div className="key-figures__row"><strong>Pasajeros internacionales</strong><b>{integer.format(intlYtd)}</b><span>{year}</span><span>OMA</span></div>
    </div>

    <section className="data-browser">
      <div className="data-browser__controls">
        <label><span>Análisis</span><select value={analysis} onChange={(e) => setAnalysis(e.target.value as Analysis)}><option value="occupancy">Ocupación a corte comparable</option><option value="capacity">Capacidad formal disponible</option><option value="demand">Contexto de demanda</option></select></label>
        <div className="display-tabs"><button className={display === 'chart' ? 'active' : ''} onClick={() => setDisplay('chart')}>Gráfica</button><button className={display === 'table' ? 'active' : ''} onClick={() => setDisplay('table')}>Tabla</button><button className={display === 'reading' ? 'active' : ''} onClick={() => setDisplay('reading')}>Interpretación</button></div>
        <span className="data-browser__source">{analysis === 'demand' ? 'OMA + UPM/DataTur' : 'DataTur'}</span>
      </div>

      <div className="data-browser__display">
        {display === 'chart' && analysis === 'occupancy' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#1769aa" strokeWidth={2.5} dot={{r:2}}/></LineChart></ResponsiveContainer></ChartFrame> : null}

        {display === 'chart' && analysis === 'capacity' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotelYear} margin={{top:16,right:20,left:-4,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#d8dee3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#5b6770'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Cuartos disponibles" stroke="#1769aa" strokeWidth={2.5} fill="#e7f0f8"/></AreaChart></ResponsiveContainer></ChartFrame> : null}

        {display === 'chart' && analysis === 'demand' ? <div className="demand-ledger"><div><span>Pasajeros terminales</span><strong>{integer.format(airYtd)}</strong><small>OMA · {year}</small></div><div><span>Pasajeros internacionales</span><strong>{integer.format(intlYtd)}</strong><small>OMA · {year}</small></div><div><span>Entradas extranjeras</span><strong>{integer.format(foreignTotal)}</strong><small>UPM / DataTur</small></div><div><span>Ocupación al corte</span><strong>{latest ? `${latest.ocupacion_pct}%` : '—'}</strong><small>DataTur</small></div></div> : null}

        {display === 'table' ? <div className="table-wrap explorer-table"><table><thead><tr>{analysis === 'demand' ? <><th>Variable</th><th>Valor</th><th>Fuente</th><th>Interpretación</th></> : <><th>Corte</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th></>}</tr></thead><tbody>{analysis === 'demand' ? <><tr><td>Pasajeros terminales</td><td>{integer.format(airYtd)}</td><td>OMA</td><td>Conectividad; no huéspedes</td></tr><tr><td>Pasajeros internacionales</td><td>{integer.format(intlYtd)}</td><td>OMA</td><td>Componente internacional del aeropuerto</td></tr><tr><td>Entradas extranjeras</td><td>{integer.format(foreignTotal)}</td><td>UPM / DataTur</td><td>Origen/nacionalidad; no noches vendidas</td></tr><tr><td>Ocupación</td><td>{latest ? `${latest.ocupacion_pct}%` : '—'}</td><td>DataTur</td><td>Corte acumulado al mes</td></tr></> : hotelYear.map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td></tr>)}</tbody></table></div> : null}

        {display === 'reading' ? <div className="reading-pane"><h2>{analysis === 'occupancy' ? 'Lectura de desempeño' : analysis === 'capacity' ? 'Lectura de capacidad' : 'Lectura de demanda'}</h2><p>{analysis === 'occupancy' ? (hotelDelta === null ? 'No hay comparación equivalente disponible.' : `El último corte cambia ${pp(hotelDelta)} frente al mismo corte del año anterior. La señal debe leerse junto con la capacidad formal disponible.`) : analysis === 'capacity' ? `La oferta reportada cambia ${pct(capacityGrowth,true)} entre el primer y el último corte de ${year}. Una mejora de ocupación con oferta creciente es distinta a una mejora causada por contracción de capacidad.` : `Aeropuerto, entradas extranjeras y ocupación describen poblaciones distintas. Sirven para contextualizar presión de demanda, pero no deben sumarse.`}</p><dl><div><dt>Decisión apoyada</dt><dd>{analysis === 'occupancy' ? 'Seguimiento operativo' : analysis === 'capacity' ? 'Planeación de oferta' : 'Promoción y lectura de demanda'}</dd></div><div><dt>Corte</dt><dd>{latest?.periodo ?? '—'}</dd></div><div><dt>Fuente</dt><dd>{analysis === 'demand' ? 'OMA + UPM/DataTur + DataTur' : 'DataTur'}</dd></div></dl></div> : null}
      </div>
    </section>

    <details className="dataset-disclosure" open><summary>Mercados internacionales de referencia</summary><div className="horizontal-ranking">{countries.slice(0,8).map((d:any,i:number)=><div key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><strong>{d.pais}</strong><div className="horizontal-ranking__bar"><i style={{width:`${Math.max(2,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div><b>{integer.format(d.valor_entradas)}</b></div>)}</div></details>
  </section>;
}
