import { Gauge, Plane, Users } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { airport, data } from '../data/model';
import { integer, pct } from '../lib/format';

export function Airport() {
  const [series, setSeries] = useState<'total' | 'mix'>('total');
  const latest = airport.at(-1);
  return <>
    <SectionHeader kicker="Conectividad aérea" title="Aeropuerto Internacional de Mazatlán" description="Pasajeros terminales mensuales con separación nacional/internacional y comparación contra el mismo mes del año anterior." />
    <div className="metric-grid metric-grid--three">
      <Metric eyebrow="Acumulado ene–ago 2026" value={integer.format(data.kpis.airportYtd)} change={pct(data.kpis.airportYtdYoY, true)} changeTone="negative" detail="vs. ene–ago 2025" icon={<Plane size={18} />} />
      <Metric eyebrow="Agosto 2026" value={integer.format(latest.pasajeros_totales_mes_actual)} change={pct(data.kpis.airportAugYoY, true)} changeTone="positive" detail="vs. agosto 2025" icon={<Gauge size={18} />} />
      <Metric eyebrow="Internacional ene–ago" value={integer.format(latest.pasajeros_internacionales_acumulado_actual)} detail="OMA · pasajeros terminales" icon={<Users size={18} />} />
    </div>
    <Panel title="Serie mensual" subtitle="Comparación interanual con los valores reportados por OMA">
      <div className="segmented"><button className={series === 'total' ? 'active' : ''} onClick={() => setSeries('total')}>Total</button><button className={series === 'mix' ? 'active' : ''} onClick={() => setSeries('mix')}>Nacional / internacional</button></div>
      <ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={airport} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false}/><YAxis tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>{series === 'total' ? <Line type="monotone" dataKey="pasajeros_totales_mes_actual" name="Pasajeros totales" stroke="#1f8a70" strokeWidth={2.7} dot={{ r: 2.5 }}/> : <><Line type="monotone" dataKey="pasajeros_nacionales_mes_actual" name="Nacionales" stroke="#315f8c" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="pasajeros_internacionales_mes_actual" name="Internacionales" stroke="#c5773d" strokeWidth={2.5} dot={false}/></>}</LineChart></ResponsiveContainer></ChartFrame>
    </Panel>
    <div className="table-wrap"><table><thead><tr><th>Periodo</th><th>Total</th><th>Nacional</th><th>Internacional</th><th>Var. total</th></tr></thead><tbody>{[...airport].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.pasajeros_totales_mes_actual)}</td><td>{integer.format(d.pasajeros_nacionales_mes_actual)}</td><td>{integer.format(d.pasajeros_internacionales_mes_actual)}</td><td className={d.yoy_total_pct >= 0 ? 'positive' : 'negative'}>{pct(d.yoy_total_pct, true)}</td></tr>)}</tbody></table></div>
  </>;
}
