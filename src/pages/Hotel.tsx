import { BedDouble, Building2, Globe2, Plane, ShieldCheck } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { data, hotel, topCountries2026 } from '../data/model';
import { integer, pct, pp } from '../lib/format';

export function Hotel() {
  const latest = hotel[hotel.length - 1];
  const first2026 = hotel.find((d:any) => d.periodo === '2026-01');
  const capacityGrowth = first2026 ? ((latest.cuartos_disponibles_promedio_diario / first2026.cuartos_disponibles_promedio_diario) - 1) * 100 : 0;

  return <>
    <SectionHeader
      kicker="Inteligencia hotelera"
      title="Capacidad, ocupación y señales de demanda para el sector de alojamiento"
      description="Un módulo operativo para hoteles, asociaciones e inversionistas. La ocupación se compara a cortes equivalentes y se contextualiza con conectividad y mercados de origen sin atribuir causalidad automática."
    />

    <div className="audience-banner audience-banner--hotel">
      <div><span>Uso recomendado</span><strong>Revenue planning · promoción · capacidad · seguimiento de demanda</strong></div>
      <div className="audience-banner__chips"><span>Hoteles</span><span>Asociaciones</span><span>Operación</span><span>Inversión</span></div>
    </div>

    <div className="metric-grid">
      <Metric eyebrow="Ocupación al corte" value={`${latest.ocupacion_pct}%`} change={pp(data.kpis.hotelSameCutDeltaPp)} changeTone="positive" detail="jun 2026 vs. mismo corte 2025" icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Cuartos disponibles" value={integer.format(latest.cuartos_disponibles_promedio_diario)} change={pct(capacityGrowth, true)} changeTone="positive" detail="promedio diario · ene→jun 2026" icon={<Building2 size={18}/>} />
      <Metric eyebrow="Cuartos ocupados" value={integer.format(latest.cuartos_ocupados)} detail="reportados al corte de jun 2026" icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Pasajeros internacionales" value={integer.format(data.kpis.airportInternationalYtd)} detail="ene–ago 2026 · contexto OMA" icon={<Plane size={18}/>} />
    </div>

    <div className="callout callout--method"><ShieldCheck size={19}/><div><strong>Regla metodológica crítica</strong><p>Los reportes mensuales de DataTur son cortes acumulados al mes. Junio 2026 se compara con junio 2025; no se promedian los porcentajes publicados de enero a diciembre como si fueran meses independientes.</p></div></div>

    <div className="executive-grid">
      <Panel title="Trayectoria de ocupación" subtitle="Porcentaje acumulado al corte · 2025–2026">
        <ChartFrame large>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hotel} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df" />
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false} interval={1}/>
              <YAxis domain={[35,65]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/>
              <Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#315f8c" strokeWidth={2.7} dot={{ r: 2.3, fill: '#fff' }}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <section className="decision-board decision-board--hotel">
        <div className="decision-board__eyebrow">Lectura operativa</div>
        <h3>Señales para la mesa hotelera</h3>
        <article><span className="decision-index">01</span><div><strong>Mejora de ocupación a corte comparable.</strong><p>El corte de junio pasa de {data.kpis.hotelSameCutPrevPct}% en 2025 a {data.kpis.hotelLatestPct}% en 2026, una diferencia de {pp(data.kpis.hotelSameCutDeltaPp)}.</p></div></article>
        <article><span className="decision-index">02</span><div><strong>Mayor base de oferta reportada.</strong><p>La capacidad disponible observada en 2026 se mantiene por encima del nivel reportado durante buena parte de 2025, por lo que la lectura de ocupación debe considerar expansión de oferta.</p></div></article>
        <article><span className="decision-index">03</span><div><strong>Conectividad y ocupación no son equivalentes.</strong><p>El aeropuerto acumula {pct(data.kpis.airportYtdYoY)} frente a 2025; su recuperación reciente es una señal de demanda potencial, no una medición directa de noches-habitación.</p></div></article>
      </section>
    </div>

    <div className="split-grid">
      <Panel title="Capacidad formal reportada" subtitle="Cuartos disponibles promedio diario">
        <ChartFrame>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hotel} margin={{top:10,right:10,left:-8,bottom:0}}>
              <defs><linearGradient id="hotelCapacity" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#315f8c" stopOpacity={0.22}/><stop offset="100%" stopColor="#315f8c" stopOpacity={0.015}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false} interval={1}/>
              <YAxis tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/>
              <Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Cuartos disponibles" stroke="#315f8c" strokeWidth={2.3} fill="url(#hotelCapacity)"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <Panel title="Mercados internacionales de referencia" subtitle="Entradas por nacionalidad · enero–junio 2026">
        <div className="market-stack">{topCountries2026.slice(0,6).map((d:any,i:number)=><article key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><small>{integer.format(d.valor_entradas)} entradas registradas</small></div><div className="market-stack__bar"><i style={{width:`${Math.max(4,d.valor_entradas/topCountries2026[0].valor_entradas*100)}%`}}/></div></article>)}</div>
        <div className="micro-note"><Globe2 size={15}/><span>Sirve para orientar promoción; las entradas por nacionalidad no representan huéspedes únicos ni noches vendidas.</span></div>
      </Panel>
    </div>

    <section className="hotel-funnel">
      <div className="hotel-funnel__head"><span className="eyebrow">Contexto de demanda</span><h3>Tres canales que el hotelero debe leer por separado</h3></div>
      <div className="hotel-funnel__grid">
        <article><span>Aéreo</span><strong>{integer.format(data.kpis.airportYtd)}</strong><small>pasajeros terminales · ene–ago</small></article>
        <article><span>Mercado extranjero</span><strong>{integer.format(data.kpis.foreignEntriesYtd)}</strong><small>entradas · ene–jun</small></article>
        <article><span>Cruceros</span><strong>{integer.format(data.kpis.cruisePaxYtd)}</strong><small>pasajeros · ene–jul</small></article>
      </div>
      <p>Estos canales ayudan a leer presión y composición de demanda, pero no deben sumarse para producir una cifra de “turistas totales”.</p>
    </section>

    <div className="table-wrap"><table><thead><tr><th>Corte</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th><th>Alcance</th></tr></thead><tbody>{[...hotel].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td><td><span className="tag">Acumulado al mes</span></td></tr>)}</tbody></table></div>
  </>;
}
