import { BedDouble, Building2, Download, Globe2, Plane, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { airport, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import { downloadObservatoryCsv, type ObservatoryYear } from '../lib/export';

type Props = {
  year: ObservatoryYear;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

type HotelView = 'performance' | 'capacity' | 'demand';

export function Hotel({ year, compare, onNavigate }: Props) {
  const [view, setView] = useState<HotelView>('performance');
  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const latest = hotelYear.at(-1);
  const first = hotelYear.at(0);
  const sameCutPrev = latest ? hotel.find((d:any) => d.periodo === `${year - 1}-${latest.periodo.slice(5)}`) : null;
  const hotelDelta = latest && sameCutPrev ? latest.ocupacion_pct - sameCutPrev.ocupacion_pct : null;
  const capacityGrowth = latest && first ? ((latest.cuartos_disponibles_promedio_diario / first.cuartos_disponibles_promedio_diario) - 1) * 100 : 0;

  const airYear = airport.filter((d:any) => d.periodo.startsWith(String(year)));
  const airYtd = airYear.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
  const intlYtd = airYear.reduce((s:number,d:any)=>s+d.pasajeros_internacionales_mes_actual,0);
  const countries = data.nationality.countries.filter((d:any)=>Number(d.anio)===year).sort((a:any,b:any)=>b.valor_entradas-a.valor_entradas);
  const foreignTotal = countries.reduce((s:number,d:any)=>s+d.valor_entradas,0);

  return <>
    <SectionHeader kicker="Inteligencia hotelera" title="Una consola operativa para alojamiento, asociaciones e inversión" description="Ocupación, oferta y señales de demanda organizadas para responder preguntas concretas: cómo va el corte, cuánto cambió la capacidad y qué mercados están detrás del flujo internacional." />

    <div className="module-tabs">
      <button className={view === 'performance' ? 'active' : ''} onClick={() => setView('performance')}><BedDouble size={15}/> Desempeño</button>
      <button className={view === 'capacity' ? 'active' : ''} onClick={() => setView('capacity')}><Building2 size={15}/> Capacidad</button>
      <button className={view === 'demand' ? 'active' : ''} onClick={() => setView('demand')}><Users size={15}/> Demanda</button>
      <span className="module-tabs__spacer"/>
      <button onClick={() => onNavigate('markets')}><Globe2 size={15}/> Mercados</button>
      <button onClick={() => downloadObservatoryCsv(year)}><Download size={15}/> Exportar</button>
    </div>

    <div className="metric-grid">
      <Metric eyebrow="Ocupación al corte" value={latest ? `${latest.ocupacion_pct}%` : '—'} change={compare && hotelDelta !== null ? pp(hotelDelta) : undefined} changeTone={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : 'negative'} detail={latest ? `${latest.periodo} · acumulado al mes` : 'sin datos'} icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Cuartos disponibles" value={latest ? integer.format(latest.cuartos_disponibles_promedio_diario) : '—'} change={pct(capacityGrowth, true)} changeTone={capacityGrowth >= 0 ? 'positive' : 'negative'} detail={`primer→último corte ${year}`} icon={<Building2 size={18}/>} />
      <Metric eyebrow="Cuartos ocupados" value={latest ? integer.format(latest.cuartos_ocupados) : '—'} detail="promedio reportado al corte" icon={<BedDouble size={18}/>} />
      <Metric eyebrow="Pasajeros internacionales" value={integer.format(intlYtd)} detail={`acumulado aéreo ${year} · OMA`} icon={<Plane size={18}/>} />
    </div>

    <div className="callout callout--method"><ShieldCheck size={19}/><div><strong>Regla metodológica crítica</strong><p>Los valores de ocupación mensual en DataTur son cortes acumulados al mes. Para comparación interanual se usa el mismo corte; no se promedian los porcentajes de todos los meses.</p></div></div>

    {view === 'performance' ? <div className="executive-grid">
      <Panel title={`Trayectoria de ocupación · ${year}`} subtitle="Porcentaje acumulado al corte"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/><XAxis dataKey="label" tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#315f8c" strokeWidth={2.7} dot={{ r: 2.3, fill: '#fff' }}/></LineChart></ResponsiveContainer></ChartFrame></Panel>
      <section className="decision-board decision-board--hotel"><div className="decision-board__eyebrow">Lectura operativa</div><h3>Qué vigilar en la mesa hotelera</h3><article><span className="decision-index">01</span><div><strong>Desempeño a corte equivalente.</strong><p>{hotelDelta === null ? 'No existe comparación equivalente en la base para este corte.' : `${pp(hotelDelta)} frente al mismo corte del año anterior.`}</p></div></article><article><span className="decision-index">02</span><div><strong>La ocupación debe leerse junto con la capacidad.</strong><p>La oferta reportada cambia {pct(capacityGrowth, true)} entre el primer y último corte de {year}.</p></div></article><article><span className="decision-index">03</span><div><strong>Conectividad no equivale a noches-habitación.</strong><p>{integer.format(airYtd)} pasajeros terminales aportan contexto de demanda potencial, no una medición directa de huéspedes.</p></div></article><button className="decision-board__action" onClick={() => onNavigate('insights')}>Ver hallazgos hoteleros</button></section>
    </div> : null}

    {view === 'capacity' ? <div className="executive-grid">
      <Panel title="Evolución de la capacidad formal" subtitle="Cuartos disponibles promedio diario"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotelYear} margin={{top:10,right:10,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df"/><XAxis dataKey="label" tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10,fill:'#66716c'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Cuartos disponibles" stroke="#315f8c" strokeWidth={2.4} fill="#e7edf3"/></AreaChart></ResponsiveContainer></ChartFrame></Panel>
      <section className="capacity-console"><span className="eyebrow">Capacidad y absorción</span><h3>La oferta crece o se contrae; la ocupación sólo tiene sentido en ese contexto.</h3><div className="capacity-console__stats"><article><span>Primer corte</span><strong>{first ? integer.format(first.cuartos_disponibles_promedio_diario) : '—'}</strong></article><article><span>Último corte</span><strong>{latest ? integer.format(latest.cuartos_disponibles_promedio_diario) : '—'}</strong></article><article><span>Cambio</span><strong>{pct(capacityGrowth, true)}</strong></article></div><p>Este módulo sirve para discutir absorción de oferta, presión competitiva y planeación de capacidad. No sustituye ADR o RevPAR, que aún no están integrados en esta base limpia.</p></section>
    </div> : null}

    {view === 'demand' ? <div className="executive-grid">
      <section className="demand-board"><span className="eyebrow">Contexto de demanda</span><h3>Tres señales que no deben sumarse</h3><div className="demand-board__grid"><article><Plane size={19}/><span>Aéreo</span><strong>{integer.format(airYtd)}</strong><small>pasajeros terminales</small><button onClick={() => onNavigate('airport')}>Abrir conectividad</button></article><article><Globe2 size={19}/><span>Mercado extranjero</span><strong>{integer.format(foreignTotal)}</strong><small>entradas registradas</small><button onClick={() => onNavigate('markets')}>Abrir mercados</button></article><article><BedDouble size={19}/><span>Ocupación</span><strong>{latest ? `${latest.ocupacion_pct}%` : '—'}</strong><small>corte acumulado</small><button onClick={() => setView('performance')}>Ver desempeño</button></article></div></section>
      <Panel title={`Mercados internacionales · ${year}`} subtitle="Entradas registradas por nacionalidad"><div className="market-stack">{countries.slice(0,8).map((d:any,i:number)=><article key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><small>{integer.format(d.valor_entradas)} entradas</small></div><div className="market-stack__bar"><i style={{width:`${Math.max(4,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div></article>)}</div></Panel>
    </div> : null}

    <div className="table-wrap"><table><thead><tr><th>Corte</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th><th>Alcance</th></tr></thead><tbody>{[...hotelYear].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td><td><span className="tag">Acumulado al mes</span></td></tr>)}</tbody></table></div>
  </>;
}
