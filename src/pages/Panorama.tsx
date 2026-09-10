import type { ReactNode } from 'react';
import { Anchor, ArrowUpRight, BedDouble, Building2, ChevronRight, Plane, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SourceNote } from '../components/SourceNote';
import { airport, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';

type Props = {
  onOpenAirport: () => void;
  onOpenBusiness: () => void;
  onOpenHotel: () => void;
};

export function Panorama({ onOpenAirport, onOpenBusiness, onOpenHotel }: Props) {
  return <>
    <section className="executive-hero">
      <div className="executive-hero__copy">
        <span className="eyebrow">Mazatlán · inteligencia turística</span>
        <h1>Un observatorio para leer la <em>demanda real</em> antes de tomar decisiones.</h1>
        <p>Conectividad, alojamiento, cruceros, mercados de origen y movilidad en una interfaz diseñada para empresarios, cámaras y operadores del sector hotelero.</p>
        <div className="executive-hero__actions">
          <button className="primary-action" onClick={onOpenBusiness}>Inteligencia empresarial <ArrowUpRight size={16}/></button>
          <button className="secondary-action" onClick={onOpenHotel}>Sector hotelero <ChevronRight size={16}/></button>
        </div>
      </div>
      <aside className="brief-card">
        <span>Brief ejecutivo</span>
        <strong>Recuperación desigual entre canales</strong>
        <p>La conectividad aérea todavía está por debajo de 2025 en el acumulado, mientras cruceros y ocupación hotelera muestran señales más favorables a sus respectivos cortes.</p>
        <div className="brief-card__meta"><span>Actualización</span><b>{data.meta.cutoff}</b></div>
      </aside>
    </section>

    <section className="audience-selector">
      <button onClick={onOpenBusiness} className="audience-card">
        <div className="audience-card__icon"><Building2 size={19}/></div>
        <span>Para cámaras y comercio</span>
        <strong>Demanda, mercados y estacionalidad comercial</strong>
        <p>Una lectura útil para campañas, inventarios, horarios, promoción y coordinación empresarial.</p>
        <b>Entrar al módulo <ArrowUpRight size={14}/></b>
      </button>
      <button onClick={onOpenHotel} className="audience-card audience-card--hotel">
        <div className="audience-card__icon"><BedDouble size={19}/></div>
        <span>Para hoteles y alojamiento</span>
        <strong>Ocupación, capacidad y contexto de llegada</strong>
        <p>Seguimiento de oferta formal y demanda potencial sin mezclar tasas, frecuencias ni fuentes.</p>
        <b>Entrar al módulo <ArrowUpRight size={14}/></b>
      </button>
    </section>

    <div className="metric-grid metric-grid--executive">
      <Metric eyebrow="Pasajeros terminales" value={integer.format(data.kpis.airportYtd)} change={pct(data.kpis.airportYtdYoY, true)} changeTone="negative" detail="ene–ago 2026 vs. 2025" icon={<Plane size={18}/>} />
      <Metric eyebrow="Ocupación hotelera" value={`${data.kpis.hotelLatestPct}%`} change={pp(data.kpis.hotelSameCutDeltaPp)} changeTone="positive" detail="corte acumulado a jun 2026" icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Pasajeros de crucero" value={integer.format(data.kpis.cruisePaxYtd)} change={pct(data.kpis.cruisePaxYtdYoY, true)} changeTone="positive" detail="ene–jul 2026 vs. 2025" icon={<Anchor size={18}/>} />
      <Metric eyebrow="Entradas extranjeras" value={integer.format(data.kpis.foreignEntriesYtd)} detail="ene–jun 2026 · UPM/DataTur" icon={<Users size={18}/>} />
    </div>

    <div className="executive-grid">
      <Panel title="Pulso de conectividad" subtitle="Pasajeros terminales mensuales · Aeropuerto Internacional de Mazatlán" action={<button className="text-button" onClick={onOpenAirport}>Detalle <ChevronRight size={14}/></button>}>
        <ChartFrame large>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={airport} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs><linearGradient id="arrivalAreaExecutive" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b7466" stopOpacity={0.24}/><stop offset="100%" stopColor="#1b7466" stopOpacity={0.015}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} interval={1}/>
              <YAxis tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>
              <Area type="monotone" dataKey="pasajeros_totales_mes_actual" name="Pasajeros" stroke="#1b7466" strokeWidth={2.4} fill="url(#arrivalAreaExecutive)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <section className="signal-console">
        <div className="signal-console__head"><span>Señales clave</span><b>4</b></div>
        <Signal tone="alert" title="Aéreo: acumulado todavía negativo">Enero–agosto se ubica {pct(data.kpis.airportYtdYoY)} frente a 2025, aunque agosto avanzó {pct(data.kpis.airportAugYoY, true)}.</Signal>
        <Signal tone="good" title="Hotelería: mejora a corte comparable">Junio 2026 reporta {data.kpis.hotelLatestPct}% frente a {data.kpis.hotelSameCutPrevPct}% al mismo corte de 2025.</Signal>
        <Signal tone="good" title="Cruceros: expansión marcada">El acumulado enero–julio crece {pct(data.kpis.cruisePaxYtdYoY, true)} en pasajeros.</Signal>
        <Signal title="Mercados: concentración alta">Canadá y Estados Unidos concentran {(data.kpis.canadaShare + data.kpis.usaShare).toFixed(1)}% del flujo extranjero registrado al corte.</Signal>
      </section>
    </div>

    <div className="split-grid">
      <Panel title="Hotelería formal" subtitle="Ocupación acumulada al mes · DataTur">
        <ChartFrame>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hotel} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} interval={1}/>
              <YAxis domain={[30,65]} tick={{ fontSize: 10, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${v}%`}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/>
              <Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#315f8c" strokeWidth={2.4} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
        <SourceNote source="Lectura correcta" note="Cada punto corresponde a un corte acumulado; no se interpreta como ocupación mensual independiente." />
      </Panel>

      <section className="editorial-panel">
        <span className="eyebrow">Nota de interpretación</span>
        <h3>El observatorio separa cada canal antes de construir una narrativa.</h3>
        <p>No sumamos pasajeros aeroportuarios, cruceristas, entradas extranjeras y aforos carreteros como si representaran personas únicas. Cada serie responde una pregunta distinta y se utiliza como señal sectorial.</p>
        <div className="editorial-rule"><span>01</span><p><strong>Flujo</strong> no es igual a turista alojado.</p></div>
        <div className="editorial-rule"><span>02</span><p><strong>Ocupación acumulada</strong> no es una tasa mensual simple.</p></div>
        <div className="editorial-rule"><span>03</span><p><strong>Contexto nacional</strong> nunca se presenta como cifra local.</p></div>
      </section>
    </div>
  </>;
}

function Signal({ title, children, tone = 'neutral' }: { title: string; children: ReactNode; tone?: 'alert' | 'good' | 'neutral' }) {
  return <article className="signal-console__item"><span className={`signal-dot signal-dot--${tone}`}/><div><strong>{title}</strong><p>{children}</p></div></article>;
}
