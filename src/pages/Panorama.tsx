import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, cruises, hotel } from '../data/model';
import enriched from '../data/enriched.json';
import { airportIntelligence, cruiseIntelligence, hotelIntelligence, marketIntelligence } from '../lib/intelligence';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onOpenAirport: () => void;
  onOpenBusiness: () => void;
  onOpenHotel: () => void;
  onOpenInsights: () => void;
};

type Lens = 'pulse' | 'hotel' | 'markets' | 'access' | 'benchmark' | 'quality';
const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const normalized = (values: number[]) => {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return values.map(() => 50);
  const min = Math.min(...valid); const max = Math.max(...valid);
  return values.map((v) => max === min ? 50 : ((v - min) / (max - min)) * 100);
};

export function Panorama({ year, viewMode, compare, onOpenAirport, onOpenBusiness, onOpenHotel, onOpenInsights }: Props) {
  const [lens, setLens] = useState<Lens>('pulse');
  const air = airportIntelligence(year);
  const hot = hotelIntelligence(year);
  const cruise = cruiseIntelligence(year);
  const market = marketIntelligence(year);
  const marketExtra = (enriched.markets as any)[String(year)] ?? (enriched.markets as any)['2026'];
  const weekly = (enriched.hotelWeekly as any[]).filter((d: any) => d.anio === year);
  const weeklyPrevious = (enriched.hotelWeekly as any[]).filter((d: any) => d.anio === year - 1);
  const latestWeek = weekly.at(-1);
  const latestWeekPrev = latestWeek ? weeklyPrevious.find((d: any) => d.periodo.endsWith(latestWeek.periodo.slice(4))) : null;
  const weeklyDelta = latestWeek && latestWeekPrev ? latestWeek.ocupacion - latestWeekPrev.ocupacion : null;

  const pulse = useMemo(() => {
    const airRows = airport.filter((d: any) => d.periodo.startsWith(String(year)));
    const cruiseRows = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
    const marketRows = (marketExtra?.monthly ?? []) as any[];
    const hotelRows = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
    const airN = normalized(airRows.map((d: any) => Number(d.pasajeros_totales_mes_actual)));
    const cruiseN = normalized(cruiseRows.map((d: any) => Number(d.pasajeros_mes_actual)));
    const marketN = normalized(marketRows.map((d: any) => Number(d.value)));
    const hotelN = normalized(hotelRows.map((d: any) => Number(d.ocupacion_pct)));
    return months.map((month, i) => ({
      month,
      air: airRows[i] ? Math.round(airN[i]) : null,
      cruise: cruiseRows[i] ? Math.round(cruiseN[i]) : null,
      foreign: marketRows[i] ? Math.round(marketN[i]) : null,
      hotel: hotelRows[i] ? Math.round(hotelN[i]) : null,
    })).filter((d: any) => [d.air,d.cruise,d.foreign,d.hotel].some((v: any) => v !== null));
  }, [year, marketExtra]);

  const calendar = useMemo(() => {
    const airRows = airport.filter((d: any) => d.periodo.startsWith(String(year)));
    const cruiseRows = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
    const marketRows = (marketExtra?.monthly ?? []) as any[];
    const airVals = airRows.map((d: any) => Number(d.pasajeros_totales_mes_actual));
    const cVals = cruiseRows.map((d: any) => Number(d.pasajeros_mes_actual));
    const mVals = marketRows.map((d: any) => Number(d.value));
    const aN = normalized(airVals), cN = normalized(cVals), mN = normalized(mVals);
    return months.map((name, i) => {
      const pieces = [airRows[i] ? aN[i] : null, cruiseRows[i] ? cN[i] : null, marketRows[i] ? mN[i] : null].filter((v): v is number => v !== null);
      const score = pieces.length ? pieces.reduce((a,b) => a+b,0) / pieces.length : 0;
      return { name, air: airRows[i]?.pasajeros_totales_mes_actual ?? null, cruise: cruiseRows[i]?.pasajeros_mes_actual ?? null, foreign: marketRows[i]?.value ?? null, score };
    }).filter((d: any) => d.air !== null || d.cruise !== null || d.foreign !== null);
  }, [year, marketExtra]);

  const eviRows = (enriched.eviNational.monthly as any[]).filter((d: any) => d.periodo.startsWith(String(year)));
  const eviAirBenchmark = (enriched.eviNational.benchmarks2026 as any[]).find((d: any) => d.via === 'Vía aérea');
  const roadStations = enriched.road.stations as any[];
  const roadComp = enriched.road.composition as any;

  const headline = year === 2026
    ? 'La demanda muestra señales mixtas: el acumulado aéreo sigue debajo de 2025, pero julio y agosto ya crecen; hotelería y cruceros presentan una lectura más favorable.'
    : '2025 cerró con una base amplia de conectividad y hotelería, pero con fuerte concentración internacional y diferencias de definición entre algunas fuentes.';

  const signalRows = [
    { label:'Aéreo', value:integer.format(air.total), delta:pct(air.yoy,true), tone:air.yoy >= 0 ? 'up':'down', note:air.recentTurnPositive ? 'Recuperación reciente pese al rezago acumulado.' : 'El acumulado no muestra todavía un giro sostenido.' },
    { label:'Hotelería', value:hot.latest ? `${hot.latest.ocupacion_pct}%` : '—', delta:hot.occupancyDelta !== null ? pp(hot.occupancyDelta) : '—', tone:(hot.occupancyDelta ?? 0)>=0?'up':'down', note:hot.absorptionSpread !== null && hot.absorptionSpread > 0 ? 'Los cuartos ocupados crecen más rápido que la oferta.' : 'La oferta exige vigilar absorción y presión competitiva.' },
    { label:'Cruceros', value:cruise.latest ? integer.format(cruise.latest.pasajeros_acumulado_actual) : '—', delta:cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth,true) : '—', tone:(cruise.passengerGrowth ?? 0)>=0?'up':'down', note:'Canal distinto al hotelero; relevante para comercio y excursiones.' },
    { label:'Mercado extranjero', value:integer.format(market.total), delta:`${market.top2Share.toFixed(1)}% top 2`, tone:'flat', note:'Dependencia extrema de Canadá y Estados Unidos.' },
  ];

  return <article className="brief-page">
    <header className="brief-hero">
      <div className="brief-hero__eyebrow">BRIEF DE INTELIGENCIA · {year}</div>
      <div className="brief-hero__grid">
        <div><h1>Qué está pasando con la economía turística de Mazatlán</h1><p>{headline}</p></div>
        <aside>
          <span>Lectura ejecutiva</span>
          <strong>{air.recentTurnPositive ? 'Recuperación en el margen' : air.yoy >= 0 ? 'Expansión' : 'Demanda desigual'}</strong>
          <p>La lectura correcta surge de comparar canales separados, no de sumarlos: aeropuerto, hotelería, cruceros, mercados y accesibilidad miden fenómenos distintos.</p>
          <button onClick={onOpenInsights}>Abrir brief de decisiones</button>
        </aside>
      </div>
    </header>

    <section className="market-tape" aria-label="Resumen de indicadores">
      {signalRows.map((r) => <div key={r.label}><span>{r.label}</span><strong>{r.value}</strong><b className={`tone-${r.tone}`}>{compare ? r.delta : '—'}</b><small>{r.note}</small></div>)}
      <div><span>Hotelería semanal</span><strong>{latestWeek ? `${latestWeek.ocupacion}%` : '—'}</strong><b className={(weeklyDelta ?? 0)>=0?'tone-up':'tone-down'}>{weeklyDelta !== null ? pp(weeklyDelta) : '—'}</b><small>Último corte semanal disponible frente a semana equivalente.</small></div>
      <div><span>Accesibilidad</span><strong>{integer.format(Number(roadStations[0]?.tdpa ?? 0))}</strong><b className="tone-flat">TDPA</b><small>Mayor aforo observado · SICT {enriched.road.observationYear}.</small></div>
    </section>

    <nav className="story-rail" aria-label="Secciones del panorama">
      <button className={lens==='pulse'?'active':''} onClick={() => setLens('pulse')}>Pulso de demanda</button>
      <button className={lens==='hotel'?'active':''} onClick={() => setLens('hotel')}>Hotelería</button>
      <button className={lens==='markets'?'active':''} onClick={() => setLens('markets')}>Mercados</button>
      <button className={lens==='access'?'active':''} onClick={() => setLens('access')}>Accesibilidad</button>
      <button className={lens==='benchmark'?'active':''} onClick={() => setLens('benchmark')}>Benchmark nacional</button>
      <button className={lens==='quality'?'active':''} onClick={() => setLens('quality')}>Calidad de datos</button>
    </nav>

    {lens === 'pulse' ? <section className="story-section">
      <div className="story-section__head"><div><span>01 · DEMANDA</span><h2>Pulso multicanal sin mezclar unidades</h2><p>Cada serie se normaliza dentro del año a una escala 0–100. Sirve para comparar el ritmo y la estacionalidad, no el tamaño absoluto.</p></div><button onClick={onOpenBusiness}>Aplicar a comercio</button></div>
      <div className="story-grid story-grid--chart">
        <div className="story-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={pulse} margin={{top:16,right:18,left:-12,bottom:0}}><CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#d7d8d2"/><XAxis dataKey="month" tick={{fontSize:11,fill:'#6b6a64'}} tickLine={false} axisLine={false}/><YAxis domain={[0,100]} ticks={[0,25,50,75,100]} tick={{fontSize:10,fill:'#8a8881'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="air" name="Aéreo" stroke="#163f59" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="cruise" name="Cruceros" stroke="#a26435" strokeWidth={2.2} dot={false}/><Line type="monotone" dataKey="foreign" name="Entradas extranjeras" stroke="#6f5b83" strokeWidth={2.2} dot={false}/><Line type="monotone" dataKey="hotel" name="Ocupación acumulada" stroke="#28745f" strokeWidth={2.2} dot={false}/></LineChart></ResponsiveContainer></ChartFrame></div>
        <aside className="story-notes">
          <div><span>Aéreo</span><strong>{air.positiveMonths}/{air.totalMonths} meses positivos interanuales</strong><p>{air.recentTurnPositive ? 'Los dos últimos meses disponibles ya están en positivo.' : 'No hay dos meses positivos consecutivos al final del tramo.'}</p></div>
          <div><span>Cruceros</span><strong>{cruise.passengerGrowth !== null ? pct(cruise.passengerGrowth,true) : '—'} pasajeros</strong><p>Los arribos cambian {cruise.arrivalGrowth !== null ? pct(cruise.arrivalGrowth,true) : '—'} y la intensidad por escala {cruise.intensityGrowth !== null ? pct(cruise.intensityGrowth,true) : '—'}.</p></div>
          <div><span>Mercados</span><strong>{marketExtra?.monthly?.[0]?.name ?? '—'}–{marketExtra?.monthly?.at(-1)?.name ?? '—'}</strong><p>El flujo extranjero local muestra estacionalidad marcada y una base muy concentrada geográficamente.</p></div>
        </aside>
      </div>

      <div className="calendar-ledger">
        <div className="calendar-ledger__head"><span>Mes</span><span>Aéreo</span><span>Cruceros</span><span>Entradas extranjeras</span><span>Presión relativa</span></div>
        {calendar.map((m: any) => <div className="calendar-ledger__row" key={m.name}><strong>{m.name}</strong><span>{m.air===null?'—':integer.format(m.air)}</span><span>{m.cruise===null?'—':integer.format(m.cruise)}</span><span>{m.foreign===null?'—':integer.format(m.foreign)}</span><div className="heat-cell"><i style={{width:`${clamp01(m.score/100)*100}%`}}/><b>{m.score>=67?'Alta':m.score>=34?'Media':'Baja'}</b></div></div>)}
      </div>
    </section> : null}

    {lens === 'hotel' ? <section className="story-section">
      <div className="story-section__head"><div><span>02 · HOTELERÍA</span><h2>La capacidad crece, pero la absorción también</h2><p>La lectura combina corte mensual comparable y seguimiento semanal acumulado, sin promediar porcentajes incompatibles.</p></div><button onClick={onOpenHotel}>Abrir módulo hotelero</button></div>
      <div className="hotel-story-grid">
        <div className="hotel-scoreboard">
          <div><span>Ocupación mensual al corte</span><strong>{hot.latest ? `${hot.latest.ocupacion_pct}%`:'—'}</strong><b>{hot.occupancyDelta !== null ? pp(hot.occupancyDelta):'—'} vs {year-1}</b></div>
          <div><span>Crecimiento de oferta</span><strong>{hot.capacityGrowth !== null ? pct(hot.capacityGrowth,true):'—'}</strong><b>cuartos disponibles</b></div>
          <div><span>Crecimiento de ocupados</span><strong>{hot.occupiedGrowth !== null ? pct(hot.occupiedGrowth,true):'—'}</strong><b>cuartos ocupados</b></div>
          <div><span>Diferencial de absorción</span><strong>{hot.absorptionSpread !== null ? `${hot.absorptionSpread.toFixed(1)} pp`:'—'}</strong><b>ocupados menos oferta</b></div>
        </div>
        <div className="story-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={weekly.map((d:any) => ({...d,week:Number(d.periodo.slice(6)),prev:weeklyPrevious.find((p:any)=>p.periodo.endsWith(d.periodo.slice(4)))?.ocupacion ?? null}))} margin={{top:14,right:18,left:-8,bottom:0}}><CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#d7d8d2"/><XAxis dataKey="week" tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><YAxis domain={[35,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/>{compare ? <Line type="monotone" dataKey="prev" name={`${year-1}`} stroke="#a7a59f" strokeDasharray="5 4" dot={false}/> : null}<Line type="monotone" dataKey="ocupacion" name={`${year}`} stroke="#28745f" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></ChartFrame></div>
      </div>
      <div className="editorial-note"><strong>Lectura operativa.</strong><p>Al último corte semanal disponible, la ocupación es {latestWeek ? `${latestWeek.ocupacion}%`:'—'} y la diferencia frente a la semana equivalente es {weeklyDelta !== null ? pp(weeklyDelta):'—'}. Esto permite seguimiento más fino que el corte mensual, pero sigue siendo acumulado a la semana.</p></div>
    </section> : null}

    {lens === 'markets' ? <section className="story-section">
      <div className="story-section__head"><div><span>03 · MERCADOS</span><h2>Mercado internacional muy concentrado y altamente norteamericano</h2><p>El desglose local por aeropuerto permite ver país, región, sexo y estacionalidad de las entradas extranjeras registradas.</p></div></div>
      <div className="market-story-grid">
        <div className="country-ranking">
          <div className="country-ranking__head"><span>Mercado</span><span>Entradas</span><span>Participación</span></div>
          {(marketExtra?.countries ?? []).slice(0,8).map((d:any) => <div key={d.name}><strong>{d.name}</strong><span>{integer.format(d.value)}</span><div><i style={{width:`${Math.min(100,d.share)}%`}}/><b>{d.share.toFixed(1)}%</b></div></div>)}
        </div>
        <aside className="market-profile">
          <div><span>Top 2 mercados</span><strong>{market.top2Share.toFixed(1)}%</strong><p>Canadá y Estados Unidos dominan el flujo extranjero registrado.</p></div>
          <div><span>América del Norte</span><strong>{Number(marketExtra?.regions?.[0]?.share ?? 0).toFixed(1)}%</strong><p>La diversificación regional es mínima.</p></div>
          <div><span>Composición por sexo</span><strong>{marketExtra?.sex?.[0]?.name ?? '—'} {Number(marketExtra?.sex?.[0]?.share ?? 0).toFixed(1)}%</strong><p>{marketExtra?.sex?.[1]?.name ?? '—'} {Number(marketExtra?.sex?.[1]?.share ?? 0).toFixed(1)}%.</p></div>
          <div><span>HHI de países</span><strong>{market.hhi.toFixed(0)}</strong><p>Indicador de concentración calculado con la distribución disponible.</p></div>
        </aside>
      </div>
      <div className="region-strip">{(marketExtra?.regions ?? []).slice(0,6).map((d:any)=><div key={d.name}><span>{d.name}</span><strong>{d.share.toFixed(2)}%</strong></div>)}</div>
    </section> : null}

    {lens === 'access' ? <section className="story-section">
      <div className="story-section__head"><div><span>04 · ACCESIBILIDAD</span><h2>La movilidad regional está fuertemente concentrada en pocos corredores</h2><p>SICT aporta aforos y composición vehicular. Es útil para logística, abastecimiento y mercado regional, no para contar turistas.</p></div></div>
      <div className="access-layout">
        <div className="road-ranking"><div className="road-ranking__head"><span>Estación</span><span>Carretera</span><span>TDPA</span></div>{roadStations.slice(0,8).map((d:any)=><div key={`${d.name}-${d.road}`}><strong>{d.name}</strong><span>{d.road}</span><b>{integer.format(d.tdpa)}</b></div>)}</div>
        <aside className="vehicle-mix"><span>Composición vehicular ponderada</span><div className="vehicle-bar"><i style={{width:`${roadComp.autos}%`}}/><i style={{width:`${roadComp.motocicletas}%`}}/><i style={{width:`${roadComp.autobuses}%`}}/><i style={{width:`${100-roadComp.autos-roadComp.motocicletas-roadComp.autobuses}%`}}/></div><dl><div><dt>Autos</dt><dd>{roadComp.autos}%</dd></div><div><dt>Motocicletas</dt><dd>{roadComp.motocicletas}%</dd></div><div><dt>Autobuses</dt><dd>{roadComp.autobuses}%</dd></div><div><dt>Carga y otros</dt><dd>{(100-roadComp.autos-roadComp.motocicletas-roadComp.autobuses).toFixed(1)}%</dd></div></dl><p>Observación {enriched.road.observationYear}. La publicación SICT 2025 reporta internamente año 2024.</p></aside>
      </div>
    </section> : null}

    {lens === 'benchmark' ? <section className="story-section">
      <div className="story-section__head"><div><span>05 · CONTEXTO NACIONAL</span><h2>Benchmark EVI: gasto y viajeros internacionales a escala nacional</h2><p>No es gasto observado en Mazatlán. Se usa sólo como referencia para entender el entorno macro del turismo internacional por vía de ingreso.</p></div></div>
      <div className="benchmark-grid">
        <div className="story-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={eviRows} margin={{top:14,right:16,left:-6,bottom:0}}><CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#d7d8d2"/><XAxis dataKey="periodo" tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><YAxis tickFormatter={(v:any)=>`${Math.round(Number(v)/1_000_000)}m`} tick={{fontSize:10,fill:'#77736d'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="income" name="Flujo monetario nacional" stroke="#6f5b83" fill="#eee8f1" strokeWidth={2.3}/></AreaChart></ResponsiveContainer></ChartFrame></div>
        <aside className="benchmark-facts"><div><span>Ingresos ene–jun 2026 vs 2025</span><strong>{pct(enriched.eviNational.incomeGrowthJanJun,true)}</strong></div><div><span>Viajeros ene–jun</span><strong>{pct(enriched.eviNational.travelerGrowthJanJun,true)}</strong></div><div><span>Benchmark vía aérea 2026</span><strong>{eviAirBenchmark ? integer.format(eviAirBenchmark.avg) : '—'} MXN</strong><p>Promedio derivado para turistas internacionales no fronterizos, vía aérea, a escala nacional.</p></div></aside>
      </div>
      <div className="benchmark-table"><div><span>Segmento nacional 2026</span><span>Vía</span><span>Promedio monetario / viajero</span></div>{(enriched.eviNational.benchmarks2026 as any[]).slice(0,5).map((d:any)=><div key={`${d.subsegment}-${d.via}`}><strong>{d.subsegment}</strong><span>{d.via}</span><b>{integer.format(d.avg)} MXN</b></div>)}</div>
    </section> : null}

    {lens === 'quality' ? <section className="story-section">
      <div className="story-section__head"><div><span>06 · TRAZABILIDAD</span><h2>Qué tan sólido es cada indicador</h2><p>La utilidad del observatorio depende de mostrar cobertura, definición y advertencias junto con cada cifra.</p></div></div>
      <div className="quality-table"><div className="quality-table__head"><span>Fuente / tema</span><span>Cobertura</span><span>Estado</span><span>Nota de uso</span></div>{(enriched.quality as any[]).map((d:any)=><div key={d.topic}><strong>{d.topic}</strong><span>{d.coverage}</span><b>{d.status}</b><p>{d.note}</p></div>)}</div>
      <div className="discrepancy-ledger"><h3>Discrepancias que no deben ocultarse</h3>{(enriched.discrepancies as any[]).map((d:any)=><div key={d.topic}><strong>{d.topic}</strong><span>{d.primary}</span><span>{d.secondary}</span><p>{d.note}</p></div>)}</div>
    </section> : null}

    <section className="next-actions">
      <div><span>Para cámaras</span><strong>Usar presión mensual, mercados y accesibilidad para calendario comercial.</strong><button onClick={onOpenBusiness}>Abrir inteligencia empresarial</button></div>
      <div><span>Para hoteles</span><strong>Seguir ocupación semanal, absorción de oferta y exposición internacional.</strong><button onClick={onOpenHotel}>Abrir inteligencia hotelera</button></div>
      <div><span>Para analistas</span><strong>Ir a series originales, metodología y limitaciones antes de inferir gasto o turistas únicos.</strong><button onClick={onOpenAirport}>Explorar series</button></div>
    </section>
  </article>;
}
