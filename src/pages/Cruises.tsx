import { Anchor, Gauge, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { cruises, data } from '../data/model';
import { integer, pct } from '../lib/format';

export function Cruises() {
  return <>
    <SectionHeader kicker="Turismo marítimo" title="Actividad de cruceros" description="Arribos, pasajeros y promedio por crucero publicados para Mazatlán por DataTur con información preliminar de SEMAR." />
    <div className="metric-grid metric-grid--three"><Metric eyebrow="Pasajeros ene–jul 2026" value={integer.format(data.kpis.cruisePaxYtd)} change={pct(data.kpis.cruisePaxYtdYoY,true)} changeTone="positive" detail="vs. mismo acumulado 2025" icon={<Users size={18}/>}/><Metric eyebrow="Arribos ene–jul 2026" value={integer.format(data.kpis.cruiseArrivalsYtd)} change={pct(data.kpis.cruiseArrivalsYtdYoY,true)} changeTone="positive" detail="vs. mismo acumulado 2025" icon={<Anchor size={18}/>}/><Metric eyebrow="Promedio jul 2026" value={integer.format(cruises.at(-1).pasajeros_promedio_mes_actual)} detail="pasajeros por arribo" icon={<Gauge size={18}/>}/></div>
    <Panel title="Pasajeros mensuales" subtitle="Serie marítima separada para no mezclar estacionalidades"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={cruises} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Bar dataKey="pasajeros_mes_actual" name="Pasajeros" fill="#c5773d" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartFrame></Panel>
  </>;
}
