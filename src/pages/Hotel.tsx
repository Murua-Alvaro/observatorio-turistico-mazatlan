import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import enriched from '../data/enriched.json';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import { airportIntelligence, hotelIntelligence, marketIntelligence } from '../lib/intelligence';

type Props = {
  year: ObservatoryYear;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

type Focus = 'operation' | 'capacity' | 'demand' | 'markets';

export function Hotel({ year, compare, onNavigate }: Props) {
  const [focus, setFocus] = useState<Focus>('operation');
  const hotel = hotelIntelligence(year);
  const air = airportIntelligence(year);
  const market = marketIntelligence(year);
  const marketExtra = (enriched.markets as any)[String(year)] ?? (enriched.markets as any)['2026'];
  const weekly = (enriched.hotelWeekly as any[]).filter((d:any) => d.anio === year);
  const previousWeekly = (enriched.hotelWeekly as any[]).filter((d:any) => d.anio === year - 1);
  const weeklySeries = weekly.map((d:any) => ({ ...d, week:Number(d.periodo.slice(6)), previous:previousWeekly.find((p:any)=>p.periodo.endsWith(d.periodo.slice(4)))?.ocupacion ?? null }));
  const latestWeek = weekly.at(-1);
  const prevWeek = latestWeek ? previousWeekly.find((d:any)=>d.periodo.endsWith(latestWeek.periodo.slice(4))) : null;
  const weekDelta = latestWeek && prevWeek ? latestWeek.ocupacion - prevWeek.ocupacion : null;
  const capacityText = hotel.capacityGrowth === null ? '—' : pct(hotel.capacityGrowth, true);
  const occupiedText = hotel.occupiedGrowth === null ? '—' : pct(hotel.occupiedGrowth, true);
  const absorptionText = hotel.absorptionSpread === null ? '—' : `${hotel.absorptionSpread.toFixed(1)} pp`;

  return <article className="sector-workspace hotel-workspace">
    <header className="sector-masthead">
      <div><span>HOTELERÍA · {year}</span><h1>Operación hotelera: ocupación, capacidad y señales de demanda</h1><p>Seguimiento mensual y semanal acumulado, comparado a cortes equivalentes. La prioridad es distinguir crecimiento de demanda, expansión de oferta y exposición a mercados.</p></div>
      <aside><strong>{latestWeek ? `${latestWeek.ocupacion}%` : '—'}</strong><span>ocupación al último corte semanal</span><b className={(weekDelta ?? 0)>=0?'tone-up':'tone-down'}>{weekDelta !== null ? pp(weekDelta) : '—'} vs semana equivalente</b></aside>
    </header>

    <nav className="workspace-tabs">
      <button className={focus==='operation'?'active':''} onClick={()=>setFocus('operation')}>Operación</button>
      <button className={focus==='capacity'?'active':''} onClick={()=>setFocus('capacity')}>Capacidad y absorción</button>
      <button className={focus==='demand'?'active':''} onClick={()=>setFocus('demand')}>Demanda</button>
      <button className={focus==='markets'?'active':''} onClick={()=>setFocus('markets')}>Mercados</button>
    </nav>

    <section className="metric-ledger metric-ledger--hotel">
      <div><span>Ocupación mensual al corte</span><strong>{hotel.latest ? `${hotel.latest.ocupacion_pct}%`:'—'}</strong><b>{compare && hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta):'—'}</b></div>
      <div><span>Oferta formal</span><strong>{hotel.latest ? integer.format(hotel.latest.cuartos_disponibles_promedio_diario):'—'}</strong><b>{capacityText}</b></div>
      <div><span>Cuartos ocupados</span><strong>{hotel.latest ? integer.format(hotel.latest.cuartos_ocupados):'—'}</strong><b>{occupiedText}</b></div>
      <div><span>Absorción relativa</span><strong>{absorptionText}</strong><b>ocupados − oferta</b></div>
      <div><span>Aéreo internacional</span><strong>{integer.format(air.international)}</strong><b>{air.internationalShare.toFixed(1)}% del total aéreo</b></div>
    </section>

    {focus === 'operation' ? <section className="workspace-section">
      <div className="workspace-section__head"><div><span>Seguimiento fino</span><h2>Ocupación semanal acumulada</h2><p>Permite ver el movimiento dentro del año con mayor frecuencia que el reporte mensual.</p></div><button onClick={()=>onNavigate('methodology')}>Ver definición</button></div>
      <div className="workspace-split workspace-split--wide">
        <div className="workspace-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={weeklySeries} margin={{top:14,right:18,left:-8,bottom:0}}><CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#d8d9d3"/><XAxis dataKey="week" tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><YAxis domain={[35,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/>{compare ? <Line type="monotone" dataKey="previous" name={`${year-1}`} stroke="#aaa7a0" strokeDasharray="5 4" dot={false}/> : null}<Line type="monotone" dataKey="ocupacion" name={`${year}`} stroke="#28745f" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></ChartFrame></div>
        <aside className="workspace-brief">
          <div><span>Última semana</span><strong>{latestWeek?.periodo ?? '—'}</strong></div>
          <div><span>Ocupación</span><strong>{latestWeek ? `${latestWeek.ocupacion}%`:'—'}</strong></div>
          <div><span>Oferta disponible</span><strong>{latestWeek ? integer.format(latestWeek.disponibles):'—'}</strong></div>
          <div><span>Cuartos ocupados</span><strong>{latestWeek ? integer.format(latestWeek.ocupados):'—'}</strong></div>
          <p><strong>Uso:</strong> seguimiento operativo, presión de capacidad y lectura de absorción. No es ocupación “de esa semana”; es acumulada a la semana.</p>
        </aside>
      </div>
    </section> : null}

    {focus === 'capacity' ? <section className="workspace-section">
      <div className="workspace-section__head"><div><span>Oferta formal</span><h2>¿La expansión de cuartos está siendo absorbida?</h2><p>El punto clave es comparar crecimiento de disponibles con crecimiento de ocupados al mismo corte.</p></div></div>
      <div className="workspace-split workspace-split--wide">
        <div className="workspace-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotel.current} margin={{top:14,right:18,left:-8,bottom:0}}><CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#d8d9d3"/><XAxis dataKey="label" tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Disponibles" stroke="#163f59" fill="#e8edf0" strokeWidth={2.3}/><Area type="monotone" dataKey="cuartos_ocupados" name="Ocupados" stroke="#28745f" fill="#e7f0eb" strokeWidth={2.3}/></AreaChart></ResponsiveContainer></ChartFrame></div>
        <div className="comparison-ledger">
          <div className="comparison-ledger__head"><span>Indicador</span><span>{year-1}</span><span>{year}</span><span>Cambio</span></div>
          <div><strong>Ocupación</strong><span>{hotel.sameCutPrevious ? `${hotel.sameCutPrevious.ocupacion_pct}%`:'—'}</span><span>{hotel.latest ? `${hotel.latest.ocupacion_pct}%`:'—'}</span><b>{hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta):'—'}</b></div>
          <div><strong>Disponibles</strong><span>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_disponibles_promedio_diario):'—'}</span><span>{hotel.latest ? integer.format(hotel.latest.cuartos_disponibles_promedio_diario):'—'}</span><b>{capacityText}</b></div>
          <div><strong>Ocupados</strong><span>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_ocupados):'—'}</span><span>{hotel.latest ? integer.format(hotel.latest.cuartos_ocupados):'—'}</span><b>{occupiedText}</b></div>
          <p>{hotel.absorptionSpread !== null && hotel.absorptionSpread > 0 ? `Los cuartos ocupados crecen ${absorptionText} más rápido que la oferta disponible. Es una señal favorable de absorción.` : 'La oferta crece al mismo ritmo o más rápido que los cuartos ocupados; conviene vigilar presión competitiva.'}</p>
        </div>
      </div>
    </section> : null}

    {focus === 'demand' ? <section className="workspace-section">
      <div className="workspace-section__head"><div><span>Contexto externo</span><h2>Conectividad y demanda internacional</h2><p>Señales relacionadas con la demanda hotelera, pero que no deben convertirse directamente en noches-habitación.</p></div></div>
      <div className="evidence-ledger">
        <div><strong>Pasajeros aéreos</strong><b>{integer.format(air.total)}</b><span className={air.yoy>=0?'tone-up':'tone-down'}>{pct(air.yoy,true)}</span><p>{air.recentTurnPositive ? 'Julio y agosto ya muestran recuperación interanual.' : 'El acumulado sigue sin giro claro.'}</p><button onClick={()=>onNavigate('airport')}>Abrir aeropuerto</button></div>
        <div><strong>Internacionales OMA</strong><b>{integer.format(air.international)}</b><span>{air.internationalShare.toFixed(1)}% del total</span><p>Es el componente más directamente relacionado con exposición externa.</p><button onClick={()=>onNavigate('airport')}>Ver mezcla</button></div>
        <div><strong>Entradas extranjeras UPM</strong><b>{integer.format(market.total)}</b><span>{market.top2Share.toFixed(1)}% top 2</span><p>Mide entradas extranjeras por nacionalidad en el aeropuerto, no pasajeros terminales totales.</p><button onClick={()=>onNavigate('markets')}>Ver mercados</button></div>
      </div>
    </section> : null}

    {focus === 'markets' ? <section className="workspace-section">
      <div className="workspace-section__head"><div><span>Segmentación</span><h2>Mercados que sostienen la demanda internacional</h2><p>País, región y sexo para orientar promoción, alianzas y producto.</p></div><button onClick={()=>onNavigate('markets')}>Abrir detalle</button></div>
      <div className="market-story-grid">
        <div className="country-ranking"><div className="country-ranking__head"><span>Mercado</span><span>Entradas</span><span>Participación</span></div>{(marketExtra?.countries ?? []).slice(0,10).map((d:any)=><div key={d.name}><strong>{d.name}</strong><span>{integer.format(d.value)}</span><div><i style={{width:`${Math.min(100,d.share)}%`}}/><b>{d.share.toFixed(1)}%</b></div></div>)}</div>
        <aside className="market-profile"><div><span>Top 2</span><strong>{market.top2Share.toFixed(1)}%</strong></div><div><span>América del Norte</span><strong>{Number(marketExtra?.regions?.[0]?.share ?? 0).toFixed(1)}%</strong></div><div><span>Mayor grupo por sexo</span><strong>{marketExtra?.sex?.[0]?.name ?? '—'} {Number(marketExtra?.sex?.[0]?.share ?? 0).toFixed(1)}%</strong></div><p>La dependencia de Canadá y Estados Unidos es estructuralmente alta. Cambios de conectividad, tipo de cambio o confianza en esos mercados pueden transmitirse rápidamente a la demanda externa.</p></aside>
      </div>
    </section> : null}
  </article>;
}
