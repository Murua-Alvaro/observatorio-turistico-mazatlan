import { ShieldCheck } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { hotel } from '../data/model';
import { integer } from '../lib/format';

export function Hotel() {
  return <>
    <SectionHeader kicker="Alojamiento" title="Hotelería formal del centro turístico" description="Oferta y ocupación reportadas por DataTur. La serie mensual se interpreta como resultados acumulados al mes, no como tasas mensuales independientes." />
    <div className="callout callout--method"><ShieldCheck size={20}/><div><strong>Regla de lectura</strong><p>Para comparar años usamos el mismo corte acumulado. Junio 2026 se compara con junio 2025. No se promedian los doce porcentajes publicados de 2025.</p></div></div>
    <div className="split-grid">
      <Panel title="Ocupación acumulada" subtitle="Porcentaje acumulado al mes"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotel} margin={{ top:10,right:12,left:-12,bottom:0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis domain={[35,65]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line dataKey="ocupacion_pct" name="Ocupación" stroke="#315f8c" strokeWidth={2.7} dot={false}/></LineChart></ResponsiveContainer></ChartFrame></Panel>
      <Panel title="Oferta reportada" subtitle="Cuartos disponibles promedio diario"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotel} margin={{top:10,right:12,left:-6,bottom:0}}><defs><linearGradient id="roomsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#315f8c" stopOpacity={0.25}/><stop offset="100%" stopColor="#315f8c" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area dataKey="cuartos_disponibles_promedio_diario" name="Cuartos disponibles" stroke="#315f8c" strokeWidth={2.5} fill="url(#roomsArea)"/></AreaChart></ResponsiveContainer></ChartFrame></Panel>
    </div>
    <div className="table-wrap"><table><thead><tr><th>Corte</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th><th>Alcance</th></tr></thead><tbody>{[...hotel].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td><td><span className="tag">Acumulado al mes</span></td></tr>)}</tbody></table></div>
  </>;
}
