import { Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { data, nationalityMonthly, topCountries2026 } from '../data/model';
import { integer } from '../lib/format';

export function Markets() {
  return <>
    <SectionHeader kicker="Mercados de origen" title="Entradas aéreas de extranjeros" description="Serie local filtrada para el aeropuerto de Mazatlán a partir de UPM/DataTur. Describe nacionalidad y sexo; no equivale a pasajeros terminales totales." />
    <div className="split-grid split-grid--wide-left"><Panel title="Evolución mensual" subtitle="Entradas registradas por UPM/DataTur"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={nationalityMonthly} margin={{top:10,right:10,left:-4,bottom:0}}><defs><linearGradient id="natArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1f8a70" stopOpacity={0.26}/><stop offset="100%" stopColor="#1f8a70" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area dataKey="valor_entradas" name="Entradas" stroke="#1f8a70" strokeWidth={2.5} fill="url(#natArea)"/></AreaChart></ResponsiveContainer></ChartFrame></Panel><Panel title="Mercados principales 2026" subtitle="Acumulado enero–junio"><div className="ranking">{topCountries2026.map((d:any,i:number)=><div className="rank" key={d.pais}><span className="rank__number">{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><span>{integer.format(d.valor_entradas)} entradas</span></div><div className="rank__bar"><span style={{width:`${Math.max(3,d.valor_entradas/topCountries2026[0].valor_entradas*100)}%`}}/></div></div>)}</div></Panel></div>
    <div className="callout"><Users size={20}/><div><strong>Concentración de mercados</strong><p>Canadá y Estados Unidos reúnen {(data.kpis.canadaShare + data.kpis.usaShare).toFixed(1)}% del flujo extranjero registrado en 2026 al corte. Es una señal comercial útil y también una exposición a pocos mercados.</p></div></div>
  </>;
}
