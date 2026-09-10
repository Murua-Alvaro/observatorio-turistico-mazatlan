import { Gauge, Plane, Users } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { airport } from '../data/model';
import { integer, pct } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props = { year: ObservatoryYear; viewMode: ViewMode; compare: boolean };
type Series = 'total' | 'national' | 'international';

export function Airport({ year, viewMode, compare }: Props) {
  const [series, setSeries] = useState<Series>('total');
  const current = airport.filter((d:any)=>d.periodo.startsWith(String(year)));
  const previous = airport.filter((d:any)=>d.periodo.startsWith(String(year-1))).slice(0,current.length);
  let runCurrent=0, runPrev=0;
  const chart = current.map((d:any,i:number)=>{
    const key = series === 'total' ? 'pasajeros_totales_mes_actual' : series === 'national' ? 'pasajeros_nacionales_mes_actual' : 'pasajeros_internacionales_mes_actual';
    const cur = d[key]; const prev = previous[i]?.[key] ?? null;
    runCurrent += cur; if(prev!==null) runPrev += prev;
    return { label:d.label, current:viewMode==='monthly'?cur:runCurrent, previous:prev===null?null:(viewMode==='monthly'?prev:runPrev), yoy:d.yoy_total_pct };
  });
  const total = current.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
  const totalPrev = previous.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
  const yoy = totalPrev ? (total/totalPrev-1)*100 : current.at(-1)?.yoy_total_pct ?? 0;
  const latest = current.at(-1);
  const intl = current.reduce((s:number,d:any)=>s+d.pasajeros_internacionales_mes_actual,0);

  return <>
    <SectionHeader kicker="Conectividad aérea" title={`Aeropuerto Internacional de Mazatlán · ${year}`} description="Explore total, mercado nacional e internacional; cambie entre vista mensual y acumulada desde la barra superior y active la comparación interanual cuando exista un tramo equivalente." />
    <div className="module-tabs module-tabs--compact"><button className={series==='total'?'active':''} onClick={()=>setSeries('total')}>Total</button><button className={series==='national'?'active':''} onClick={()=>setSeries('national')}>Nacional</button><button className={series==='international'?'active':''} onClick={()=>setSeries('international')}>Internacional</button></div>
    <div className="metric-grid metric-grid--three"><Metric eyebrow={`Acumulado ${year}`} value={integer.format(total)} change={compare?pct(yoy,true):undefined} changeTone={yoy>=0?'positive':'negative'} detail="pasajeros terminales · OMA" icon={<Plane size={18}/>}/><Metric eyebrow="Último mes disponible" value={latest?integer.format(latest.pasajeros_totales_mes_actual):'—'} change={latest?pct(latest.yoy_total_pct,true):undefined} changeTone={latest?.yoy_total_pct>=0?'positive':'negative'} detail={latest?.periodo ?? 'sin datos'} icon={<Gauge size={18}/>}/><Metric eyebrow="Internacional acumulado" value={integer.format(intl)} detail={`${year} · pasajeros terminales`} icon={<Users size={18}/>}/></div>
    <Panel title={`${series==='total'?'Pasajeros totales':series==='national'?'Pasajeros nacionales':'Pasajeros internacionales'} · ${viewMode==='monthly'?'mensual':'acumulado'}`} subtitle={compare&&previous.length?`Comparación ${year} vs ${year-1}`:'Serie del año seleccionado'}><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{top:16,right:12,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Legend iconType="circle" wrapperStyle={{fontSize:11}}/>{compare&&previous.length?<Line type="monotone" dataKey="previous" name={`${year-1}`} stroke="#aab2ae" strokeWidth={1.8} strokeDasharray="5 5" dot={false}/>:null}<Line type="monotone" dataKey="current" name={`${year}`} stroke="#1b7466" strokeWidth={2.8} dot={{r:2.5}}/></LineChart></ResponsiveContainer></ChartFrame></Panel>
    <div className="table-wrap"><table><thead><tr><th>Periodo</th><th>Total</th><th>Nacional</th><th>Internacional</th><th>Var. total</th></tr></thead><tbody>{[...current].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.pasajeros_totales_mes_actual)}</td><td>{integer.format(d.pasajeros_nacionales_mes_actual)}</td><td>{integer.format(d.pasajeros_internacionales_mes_actual)}</td><td className={d.yoy_total_pct>=0?'positive':'negative'}>{pct(d.yoy_total_pct,true)}</td></tr>)}</tbody></table></div>
  </>;
}
