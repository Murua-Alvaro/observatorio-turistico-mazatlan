import type { ReactNode } from 'react';
import { Anchor, BedDouble, ChevronRight, Plane, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SourceNote } from '../components/SourceNote';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, cruises, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';

export function Panorama({ onOpenAirport }: { onOpenAirport: () => void }) {
  return (
    <>
      <div className="metric-grid">
        <Metric eyebrow="Pasajeros terminales" value={integer.format(data.kpis.airportYtd)} change={pct(data.kpis.airportYtdYoY, true)} changeTone="negative" detail="ene–ago 2026 vs. 2025" icon={<Plane size={18} />} />
        <Metric eyebrow="Ocupación hotelera" value={`${data.kpis.hotelLatestPct}%`} change={pp(data.kpis.hotelSameCutDeltaPp)} changeTone="positive" detail="corte acumulado a jun 2026" icon={<BedDouble size={18} />} />
        <Metric eyebrow="Pasajeros de crucero" value={integer.format(data.kpis.cruisePaxYtd)} change={pct(data.kpis.cruisePaxYtdYoY, true)} changeTone="positive" detail="ene–jul 2026 vs. 2025" icon={<Anchor size={18} />} />
        <Metric eyebrow="Entradas aéreas extranjeras" value={integer.format(data.kpis.foreignEntriesYtd)} detail="ene–jun 2026 · UPM/DataTur" icon={<Users size={18} />} />
      </div>

      <div className="split-grid split-grid--wide-left">
        <Panel title="Pulso de llegada aérea" subtitle="Pasajeros terminales mensuales del Aeropuerto Internacional de Mazatlán" action={<button className="text-button" onClick={onOpenAirport}>Explorar <ChevronRight size={15} /></button>}>
          <ChartFrame large>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={airport} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs><linearGradient id="arrivalArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1f8a70" stopOpacity={0.28} /><stop offset="100%" stopColor="#1f8a70" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => integer.format(Number(v))} />
                <Area type="monotone" dataKey="pasajeros_totales_mes_actual" name="Pasajeros" stroke="#1f8a70" strokeWidth={2.5} fill="url(#arrivalArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel title="Lectura ejecutiva" subtitle="Señales útiles para decisión, sin mezclar escalas ni frecuencias">
          <div className="signal-list">
            <Signal tone="alert" title="El acumulado aéreo sigue debajo de 2025">Entre enero y agosto, MZT registra {pct(data.kpis.airportYtdYoY)}; agosto por sí solo creció {pct(data.kpis.airportAugYoY, true)} interanual.</Signal>
            <Signal tone="good" title="La ocupación mejora en cortes equivalentes">Junio 2026 reporta {data.kpis.hotelLatestPct}% acumulado frente a {data.kpis.hotelSameCutPrevPct}% al mismo corte de 2025.</Signal>
            <Signal tone="good" title="Cruceros aceleran con fuerza">Enero–julio suma {integer.format(data.kpis.cruisePaxYtd)} pasajeros, {pct(data.kpis.cruisePaxYtdYoY, true)} frente al mismo acumulado previo.</Signal>
            <Signal title="Alta concentración internacional">Canadá representa {data.kpis.canadaShare}% y Estados Unidos {data.kpis.usaShare}% de las entradas aéreas extranjeras registradas en 2026 al corte.</Signal>
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel title="Hotelería" subtitle="Ocupación acumulada al mes · DataTur">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hotel} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis domain={[30, 65]} tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                <Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#315f8c" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
          <SourceNote source="Regla de lectura" note="Cada punto es un resultado acumulado al corte indicado; no se promedian como meses independientes." />
        </Panel>
        <Panel title="Cruceros" subtitle="Pasajeros mensuales · SEMAR / DataTur">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cruises} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#66756f' }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => integer.format(Number(v))} />
                <Bar dataKey="pasajeros_mes_actual" name="Pasajeros" fill="#c5773d" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
          <SourceNote source="Corte" note="La serie disponible llega a julio de 2026 y las cifras son preliminares." />
        </Panel>
      </div>
    </>
  );
}

function Signal({ title, children, tone = 'neutral' }: { title: string; children: ReactNode; tone?: 'alert' | 'good' | 'neutral' }) {
  return <div className="signal"><span className={`signal__marker ${tone === 'alert' ? 'signal__marker--alert' : tone === 'good' ? 'signal__marker--good' : ''}`} /><div><strong>{title}</strong><p>{children}</p></div></div>;
}
