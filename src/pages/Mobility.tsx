import { CarFront, Gauge } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { busiestRoads, data } from '../data/model';
import { integer } from '../lib/format';

export function Mobility() {
  return <>
    <SectionHeader kicker="Accesibilidad terrestre" title="Aforos viales en rutas vinculadas con Mazatlán" description="TDPA y composición vehicular de estaciones SICT. Sirve para aproximar presión de movilidad; no cuenta turistas." />
    <div className="metric-grid metric-grid--two"><Metric eyebrow="TDPA mediano" value={integer.format(data.kpis.roadMedianTdpa)} detail="vehículos/día · estaciones incluidas" icon={<CarFront size={18}/>}/><Metric eyebrow="TDPA máximo" value={integer.format(data.kpis.roadMaxTdpa)} detail="vehículos/día · estación con mayor aforo" icon={<Gauge size={18}/>}/></div>
    <Panel title="Estaciones con mayor aforo" subtitle="Publicación SICT 2025; año de observación reportado: 2024"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={busiestRoads} layout="vertical" margin={{top:8,right:14,left:28,bottom:0}}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dfe8e4"/><XAxis type="number" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis type="category" dataKey="estacion" width={150} tick={{fontSize:10,fill:'#66756f'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Bar dataKey="tdpa" name="TDPA" fill="#315f8c" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></ChartFrame></Panel>
  </>;
}
