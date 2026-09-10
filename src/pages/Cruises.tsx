import { Anchor, Gauge, Users } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { cruises } from '../data/model';
import { integer, pct } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props={year:ObservatoryYear;viewMode:ViewMode;compare:boolean};
type Series='passengers'|'arrivals'|'average';

export function Cruises({year,viewMode,compare}:Props){
  const [series,setSeries]=useState<Series>('passengers');
  const current=cruises.filter((d:any)=>d.periodo.startsWith(String(year)));
  const previous=cruises.filter((d:any)=>d.periodo.startsWith(String(year-1))).slice(0,current.length);
  const latest=current.at(-1);
  const prevCut=latest?cruises.find((d:any)=>d.periodo===`${year-1}-${latest.periodo.slice(5)}`):null;
  const paxYoy=latest&&prevCut?((latest.pasajeros_acumulado_actual/prevCut.pasajeros_acumulado_actual)-1)*100:null;
  const arrYoy=latest&&prevCut?((latest.arribos_acumulado_actual/prevCut.arribos_acumulado_actual)-1)*100:null;

  const chart=current.map((d:any,i:number)=>{
    const prior=current[i-1];
    const prev=previous[i];
    const prevPrior=previous[i-1];
    const arrivalsMonthly=i===0?d.arribos_acumulado_actual:d.arribos_acumulado_actual-prior.arribos_acumulado_actual;
    const prevArrivalsMonthly=prev?(i===0?prev.arribos_acumulado_actual:prev.arribos_acumulado_actual-(prevPrior?.arribos_acumulado_actual??0)):null;
    const currentValue=series==='passengers'?(viewMode==='monthly'?d.pasajeros_mes_actual:d.pasajeros_acumulado_actual):series==='arrivals'?(viewMode==='monthly'?arrivalsMonthly:d.arribos_acumulado_actual):d.pasajeros_promedio_mes_actual;
    const previousValue=!prev?null:series==='passengers'?(viewMode==='monthly'?prev.pasajeros_mes_actual:prev.pasajeros_acumulado_actual):series==='arrivals'?(viewMode==='monthly'?prevArrivalsMonthly:prev.arribos_acumulado_actual):prev.pasajeros_promedio_mes_actual;
    return{label:d.label,current:currentValue,previous:previousValue};
  });

  return <>
    <SectionHeader kicker="Turismo marítimo" title={`Actividad de cruceros · ${year}`} description="Explore pasajeros, arribos y promedio por crucero sin mezclar el flujo marítimo con alojamiento. La barra superior controla vista mensual/acumulada y comparación interanual."/>
    <div className="module-tabs module-tabs--compact"><button className={series==='passengers'?'active':''} onClick={()=>setSeries('passengers')}>Pasajeros</button><button className={series==='arrivals'?'active':''} onClick={()=>setSeries('arrivals')}>Arribos</button><button className={series==='average'?'active':''} onClick={()=>setSeries('average')}>Promedio por arribo</button></div>
    <div className="metric-grid metric-grid--three"><Metric eyebrow="Pasajeros al corte" value={latest?integer.format(latest.pasajeros_acumulado_actual):'—'} change={compare&&paxYoy!==null?pct(paxYoy,true):undefined} changeTone={paxYoy!==null&&paxYoy>=0?'positive':'negative'} detail={latest?.periodo??'sin datos'} icon={<Users size={18}/>}/><Metric eyebrow="Arribos al corte" value={latest?integer.format(latest.arribos_acumulado_actual):'—'} change={compare&&arrYoy!==null?pct(arrYoy,true):undefined} changeTone={arrYoy!==null&&arrYoy>=0?'positive':'negative'} detail={latest?.periodo??'sin datos'} icon={<Anchor size={18}/>}/><Metric eyebrow="Promedio último mes" value={latest?integer.format(latest.pasajeros_promedio_mes_actual):'—'} detail="pasajeros por arribo" icon={<Gauge size={18}/>}/></div>
    <Panel title={`${series==='passengers'?'Pasajeros':series==='arrivals'?'Arribos':'Promedio por arribo'} · ${viewMode==='monthly'?'mensual':'acumulado'}`} subtitle="DataTur / SEMAR · cifras preliminares"><ChartFrame large><ResponsiveContainer width="100%" height="100%">{series==='average'?<LineChart data={chart} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Legend iconType="circle" wrapperStyle={{fontSize:11}}/>{compare&&previous.length?<Line dataKey="previous" name={`${year-1}`} stroke="#aab2ae" strokeDasharray="5 5" dot={false}/>:null}<Line dataKey="current" name={`${year}`} stroke="#a96e42" strokeWidth={2.7} dot={{r:2.5}}/></LineChart>:<BarChart data={chart} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>series==='passengers'?`${Math.round(Number(v)/1000)}k`:String(v)}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Legend iconType="circle" wrapperStyle={{fontSize:11}}/>{compare&&previous.length?<Bar dataKey="previous" name={`${year-1}`} fill="#d7d1cc" radius={[5,5,0,0]}/>:null}<Bar dataKey="current" name={`${year}`} fill="#a96e42" radius={[5,5,0,0]}/></BarChart>}</ResponsiveContainer></ChartFrame></Panel>
  </>;
}
