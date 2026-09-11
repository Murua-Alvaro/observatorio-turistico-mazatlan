import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, cruises, hotel } from '../data/model';
import enriched from '../data/enriched.json';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import type { ViewMode } from '../App';

type Props = {
  year: ObservatoryYear;
  viewMode: ViewMode;
  compare: boolean;
  onYearChange: (year: ObservatoryYear) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCompareChange: (compare: boolean) => void;
  onOpenAirport: () => void;
  onOpenBusiness: () => void;
  onOpenHotel: () => void;
  onOpenInsights: () => void;
};

type Family = 'air' | 'hotel' | 'cruise' | 'markets' | 'mobility' | 'benchmark';
type Display = 'chart' | 'table' | 'guide';

type MetricDefinition = {
  id: string;
  family: Family;
  label: string;
  short: string;
  unit: string;
  frequency: string;
  source: string;
  coverage: string;
  definition: string;
  caution: string;
  supportsCumulative?: boolean;
  kind: 'series' | 'distribution';
};

type SeriesPoint = { label: string; period: string; current: number; previous?: number | null };
type DistributionPoint = { label: string; value: number; detail?: string };

const monthShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const familyLabel: Record<Family, string> = {
  air: 'Conectividad aérea', hotel: 'Hotelería', cruise: 'Cruceros', markets: 'Mercados internacionales', mobility: 'Movilidad terrestre', benchmark: 'Benchmark nacional',
};

const metricDefs: MetricDefinition[] = [
  { id:'air_total', family:'air', label:'Pasajeros aéreos totales', short:'Total', unit:'pasajeros', frequency:'Mensual', source:'OMA', coverage:'2025-01 a 2026-08', definition:'Pasajeros terminales totales atendidos por el aeropuerto de Mazatlán.', caution:'Pasajeros terminales no equivalen a turistas únicos ni a huéspedes de hotel.', supportsCumulative:true, kind:'series' },
  { id:'air_domestic', family:'air', label:'Pasajeros nacionales', short:'Nacionales', unit:'pasajeros', frequency:'Mensual', source:'OMA', coverage:'2025-01 a 2026-08', definition:'Pasajeros terminales de tráfico nacional.', caution:'Mide conectividad aérea, no pernocta ni gasto.', supportsCumulative:true, kind:'series' },
  { id:'air_international', family:'air', label:'Pasajeros internacionales', short:'Internacionales', unit:'pasajeros', frequency:'Mensual', source:'OMA', coverage:'2025-01 a 2026-08', definition:'Pasajeros terminales de tráfico internacional.', caution:'No es igual a la base de nacionalidad UPM; las poblaciones y definiciones son distintas.', supportsCumulative:true, kind:'series' },

  { id:'hotel_occ_month', family:'hotel', label:'Ocupación hotelera al corte', short:'Ocupación mensual', unit:'%', frequency:'Corte acumulado al mes', source:'DataTur', coverage:'2025-01 a 2026-06', definition:'Porcentaje de ocupación reportado por DataTur al cierre acumulado de cada mes.', caution:'No debe promediarse como si cada observación fuera una tasa mensual independiente.', kind:'series' },
  { id:'hotel_occ_week', family:'hotel', label:'Ocupación hotelera semanal', short:'Ocupación semanal', unit:'%', frequency:'Corte acumulado semanal', source:'DataTur', coverage:'2025-S01 a 2026-S25', definition:'Ocupación reportada al corte de cada semana disponible.', caution:'Es un corte acumulado semanal; compare semana equivalente contra semana equivalente.', kind:'series' },
  { id:'hotel_available', family:'hotel', label:'Cuartos disponibles', short:'Disponibles', unit:'cuartos promedio/día', frequency:'Corte acumulado al mes', source:'DataTur', coverage:'2025-01 a 2026-06', definition:'Promedio diario de cuartos disponibles dentro de la muestra formal reportada.', caution:'La muestra y cobertura hotelera pueden cambiar con el tiempo.', kind:'series' },
  { id:'hotel_occupied', family:'hotel', label:'Cuartos ocupados', short:'Ocupados', unit:'cuartos', frequency:'Corte acumulado al mes', source:'DataTur', coverage:'2025-01 a 2026-06', definition:'Cuartos ocupados reportados en el corte acumulado.', caution:'Interprételo junto con el crecimiento de la oferta disponible.', kind:'series' },

  { id:'cruise_month', family:'cruise', label:'Pasajeros de crucero por mes', short:'Pasajeros mes', unit:'pasajeros', frequency:'Mensual', source:'DataTur / SEMAR', coverage:'2025-01 a 2026-07', definition:'Pasajeros de crucero reportados durante el mes.', caution:'El crucerista es visitante de corta estancia y no debe sumarse como equivalente a demanda hotelera.', supportsCumulative:true, kind:'series' },
  { id:'cruise_arrivals', family:'cruise', label:'Arribos de crucero acumulados', short:'Arribos', unit:'arribos', frequency:'Acumulado al mes', source:'DataTur / SEMAR', coverage:'2025-01 a 2026-07', definition:'Número acumulado de arribos de crucero al corte.', caution:'Serie preliminar y sujeta a revisión administrativa.', kind:'series' },
  { id:'cruise_intensity', family:'cruise', label:'Pasajeros promedio por crucero', short:'Intensidad por arribo', unit:'pasajeros por crucero', frequency:'Mensual', source:'DataTur / SEMAR', coverage:'2025-01 a 2026-07', definition:'Pasajeros del mes divididos entre los arribos del mes.', caution:'Un aumento puede venir de barcos de mayor capacidad, ocupación o composición de escalas.', kind:'series' },

  { id:'market_entries', family:'markets', label:'Entradas extranjeras registradas', short:'Entradas', unit:'entradas', frequency:'Mensual', source:'UPM / DataTur', coverage:'2025-01 a 2026-06', definition:'Entradas de personas extranjeras registradas en la base UPM filtrada al aeropuerto de Mazatlán.', caution:'No equivale al total de pasajeros internacionales OMA.', supportsCumulative:true, kind:'series' },
  { id:'market_countries', family:'markets', label:'Mercados por país', short:'Países', unit:'participación %', frequency:'Acumulado disponible', source:'UPM / DataTur', coverage:'2025 completo; 2026 ene-jun', definition:'Distribución de entradas extranjeras según país de nacionalidad.', caution:'La elevada concentración en Canadá y Estados Unidos implica exposición a pocos mercados.', kind:'distribution' },
  { id:'market_regions', family:'markets', label:'Mercados por región', short:'Regiones', unit:'participación %', frequency:'Acumulado disponible', source:'UPM / DataTur', coverage:'2025 completo; 2026 ene-jun', definition:'Distribución de entradas extranjeras agrupada por región de nacionalidad.', caution:'Es nacionalidad registrada, no residencia habitual ni gasto.', kind:'distribution' },
  { id:'market_sex', family:'markets', label:'Composición por sexo', short:'Sexo', unit:'participación %', frequency:'Acumulado disponible', source:'UPM / DataTur', coverage:'2025 completo; 2026 ene-jun', definition:'Distribución de entradas extranjeras por sexo registrado.', caution:'Describe composición de registros, no comportamiento de gasto o estancia.', kind:'distribution' },

  { id:'road_tdpa', family:'mobility', label:'Aforo carretero por estación', short:'TDPA', unit:'vehículos/día', frequency:'Observación anual', source:'SICT', coverage:'Año observado 2024', definition:'Tránsito Diario Promedio Anual observado en estaciones carreteras vinculadas al corredor de Mazatlán.', caution:'No representa turistas únicos. Incluye viajes locales, carga, autobuses y otros vehículos.', kind:'distribution' },
  { id:'road_mix', family:'mobility', label:'Composición vehicular', short:'Tipo de vehículo', unit:'participación %', frequency:'Observación anual', source:'SICT', coverage:'Año observado 2024', definition:'Participación por tipo de vehículo en los aforos disponibles.', caution:'Es una composición del tránsito carretero, no de visitantes.', kind:'distribution' },

  { id:'evi_travelers', family:'benchmark', label:'Viajeros internacionales · México', short:'Viajeros nacionales', unit:'viajeros', frequency:'Mensual', source:'INEGI EVI', coverage:'2025-01 a 2026-06', definition:'Total nacional de viajeros internacionales del EVI; se usa solo como contexto de mercado.', caution:'Es benchmark nacional. No representa viajeros observados en Mazatlán.', supportsCumulative:true, kind:'series' },
  { id:'evi_income', family:'benchmark', label:'Ingresos por viajeros · México', short:'Ingresos nacionales', unit:'MXN', frequency:'Mensual', source:'INEGI EVI', coverage:'2025-01 a 2026-06', definition:'Ingreso nacional asociado a viajeros internacionales según EVI.', caution:'No es derrama local de Mazatlán.', supportsCumulative:true, kind:'series' },
  { id:'evi_avg', family:'benchmark', label:'Gasto medio por viajero · México', short:'Gasto medio', unit:'MXN por viajero', frequency:'Mensual', source:'INEGI EVI', coverage:'2025-01 a 2026-06', definition:'Ingreso dividido entre viajeros a escala nacional.', caution:'Sirve como benchmark nacional, no como estimación del gasto medio en Mazatlán.', kind:'series' },
  { id:'evi_segments', family:'benchmark', label:'Gasto medio por segmento · México', short:'Segmentos', unit:'MXN por viajero', frequency:'Benchmark 2026', source:'INEGI EVI', coverage:'2026', definition:'Gasto medio nacional por tipo de viajero y vía de entrada.', caution:'No debe aplicarse directamente a los flujos de Mazatlán para estimar derrama.', kind:'distribution' },
];

const firstMetric: Record<Family,string> = {
  air:'air_total', hotel:'hotel_occ_month', cruise:'cruise_month', markets:'market_entries', mobility:'road_tdpa', benchmark:'evi_avg',
};

const changePct = (current: number, previous: number | null | undefined) => previous ? ((current / previous) - 1) * 100 : null;
const cumulate = (values: number[]) => { let s = 0; return values.map((v) => (s += v)); };
const formatMetric = (value: number | null | undefined, def: MetricDefinition) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (def.unit === '%' || def.unit === 'participación %') return `${value.toFixed(1)}%`;
  if (def.unit.includes('MXN')) return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value);
  return integer.format(Math.round(value));
};

export function Panorama({ year, viewMode, compare, onYearChange, onViewModeChange, onCompareChange, onOpenAirport, onOpenBusiness, onOpenHotel, onOpenInsights }: Props) {
  const [family, setFamily] = useState<Family>('air');
  const [metricId, setMetricId] = useState('air_total');
  const [display, setDisplay] = useState<Display>('chart');

  const def = metricDefs.find((d) => d.id === metricId) ?? metricDefs[0];
  const familyMetrics = metricDefs.filter((d) => d.family === family);

  const changeFamily = (next: Family) => {
    setFamily(next);
    setMetricId(firstMetric[next]);
    setDisplay('chart');
  };

  const series = useMemo<SeriesPoint[]>(() => {
    const prevYear = year - 1;
    if (metricId.startsWith('air_')) {
      const key = metricId === 'air_total' ? 'pasajeros_totales_mes_actual' : metricId === 'air_domestic' ? 'pasajeros_nacionales_mes_actual' : 'pasajeros_internacionales_mes_actual';
      const cur = airport.filter((d:any) => d.periodo.startsWith(String(year)));
      const prev = airport.filter((d:any) => d.periodo.startsWith(String(prevYear)));
      const curVals = cur.map((d:any) => Number(d[key]));
      const prevVals = prev.slice(0, cur.length).map((d:any) => Number(d[key]));
      const current = viewMode === 'cumulative' ? cumulate(curVals) : curVals;
      const previous = viewMode === 'cumulative' ? cumulate(prevVals) : prevVals;
      return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:current[i], previous:previous[i] ?? null }));
    }
    if (metricId === 'hotel_occ_week') {
      const cur = (enriched.hotelWeekly as any[]).filter((d:any) => d.anio === year);
      const prev = (enriched.hotelWeekly as any[]).filter((d:any) => d.anio === prevYear);
      return cur.map((d:any,i:number) => ({ label:`S${String(i+1).padStart(2,'0')}`, period:d.periodo, current:Number(d.ocupacion), previous:prev[i]?.ocupacion ?? null }));
    }
    if (metricId.startsWith('hotel_')) {
      const key = metricId === 'hotel_occ_month' ? 'ocupacion_pct' : metricId === 'hotel_available' ? 'cuartos_disponibles_promedio_diario' : 'cuartos_ocupados';
      const cur = hotel.filter((d:any) => d.periodo.startsWith(String(year)));
      const prev = hotel.filter((d:any) => d.periodo.startsWith(String(prevYear)));
      return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:Number(d[key]), previous:prev[i]?.[key] ?? null }));
    }
    if (metricId.startsWith('cruise_')) {
      const cur = cruises.filter((d:any) => d.periodo.startsWith(String(year)));
      const prev = cruises.filter((d:any) => d.periodo.startsWith(String(prevYear)));
      if (metricId === 'cruise_month') {
        const curVals = cur.map((d:any) => Number(d.pasajeros_mes_actual));
        const prevVals = prev.slice(0,cur.length).map((d:any) => Number(d.pasajeros_mes_actual));
        const current = viewMode === 'cumulative' ? cumulate(curVals) : curVals;
        const previous = viewMode === 'cumulative' ? cumulate(prevVals) : prevVals;
        return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:current[i], previous:previous[i] ?? null }));
      }
      if (metricId === 'cruise_arrivals') return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:Number(d.arribos_acumulado_actual), previous:prev[i]?.arribos_acumulado_actual ?? null }));
      return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:Number(d.pasajeros_promedio_mes_actual), previous:prev[i]?.pasajeros_promedio_mes_actual ?? null }));
    }
    if (metricId === 'market_entries') {
      const curObj = (enriched.markets as any)[String(year)];
      const prevObj = (enriched.markets as any)[String(prevYear)];
      const cur = (curObj?.monthly ?? []) as any[];
      const prev = (prevObj?.monthly ?? []) as any[];
      const curVals = cur.map((d:any) => Number(d.value));
      const prevVals = prev.slice(0,cur.length).map((d:any) => Number(d.value));
      const current = viewMode === 'cumulative' ? cumulate(curVals) : curVals;
      const previous = viewMode === 'cumulative' ? cumulate(prevVals) : prevVals;
      return cur.map((d:any,i:number) => ({ label:monthShort[d.month-1], period:`${year}-${String(d.month).padStart(2,'0')}`, current:current[i], previous:previous[i] ?? null }));
    }
    if (metricId.startsWith('evi_') && metricId !== 'evi_segments') {
      const key = metricId === 'evi_travelers' ? 'travelers' : metricId === 'evi_income' ? 'income' : 'avg';
      const cur = (enriched.eviNational.monthly as any[]).filter((d:any) => d.periodo.startsWith(String(year)));
      const prev = (enriched.eviNational.monthly as any[]).filter((d:any) => d.periodo.startsWith(String(prevYear)));
      const curVals = cur.map((d:any) => Number(d[key]));
      const prevVals = prev.slice(0,cur.length).map((d:any) => Number(d[key]));
      const current = def.supportsCumulative && viewMode === 'cumulative' ? cumulate(curVals) : curVals;
      const previous = def.supportsCumulative && viewMode === 'cumulative' ? cumulate(prevVals) : prevVals;
      return cur.map((d:any,i:number) => ({ label:monthShort[Number(d.periodo.slice(5))-1], period:d.periodo, current:current[i], previous:previous[i] ?? null }));
    }
    return [];
  }, [metricId, year, viewMode, def.supportsCumulative]);

  const distribution = useMemo<DistributionPoint[]>(() => {
    const marketObj = (enriched.markets as any)[String(year)] ?? (enriched.markets as any)['2026'];
    if (metricId === 'market_countries') return (marketObj?.countries ?? []).slice(0,10).map((d:any) => ({label:d.name,value:Number(d.share),detail:integer.format(d.value)}));
    if (metricId === 'market_regions') return (marketObj?.regions ?? []).map((d:any) => ({label:d.name,value:Number(d.share),detail:integer.format(d.value)}));
    if (metricId === 'market_sex') return (marketObj?.sex ?? []).map((d:any) => ({label:d.name,value:Number(d.share),detail:integer.format(d.value)}));
    if (metricId === 'road_tdpa') return (enriched.road.stations as any[]).slice(0,12).map((d:any) => ({label:d.name,value:Number(d.tdpa),detail:d.road}));
    if (metricId === 'road_mix') {
      const labels:Record<string,string>={motocicletas:'Motocicletas',autos:'Autos',autobuses:'Autobuses',c2:'Camión C2',c3:'Camión C3',t3s2:'T3-S2',t3s3:'T3-S3',t3s2r4:'T3-S2-R4',otros:'Otros'};
      return Object.entries(enriched.road.composition as Record<string,number>).map(([k,v]) => ({label:labels[k]??k,value:Number(v)})).sort((a,b)=>b.value-a.value);
    }
    if (metricId === 'evi_segments') return (enriched.eviNational.benchmarks2026 as any[]).map((d:any) => ({label:d.via,value:Number(d.avg),detail:d.subsegment})).sort((a,b)=>b.value-a.value);
    return [];
  }, [metricId, year]);

  const latest = series.at(-1);
  const latestDelta = latest ? changePct(latest.current, latest.previous) : null;
  const peak = series.length ? [...series].sort((a,b)=>b.current-a.current)[0] : null;
  const low = series.length ? [...series].sort((a,b)=>a.current-b.current)[0] : null;
  const prevPoint = series.length > 1 ? series.at(-2) : null;
  const shortMomentum = latest && prevPoint ? changePct(latest.current, prevPoint.current) : null;
  const distLead = distribution[0];

  const currentValue = def.kind === 'series' ? formatMetric(latest?.current,def) : formatMetric(distLead?.value,def);
  const currentPeriod = def.kind === 'series' ? (latest?.period ?? '—') : (metricId.startsWith('road_') ? '2024' : year === 2026 ? '2026 · corte disponible' : '2025');

  const interpretation = (() => {
    if (def.kind === 'distribution') {
      if (metricId === 'market_countries') return `${distLead?.label ?? 'El mercado líder'} concentra ${distLead ? distLead.value.toFixed(1) : '—'}% de las entradas registradas. La distribución está muy concentrada.`;
      if (metricId === 'market_regions') return `La estructura internacional está dominada por ${distLead?.label ?? 'la región líder'}, con ${distLead ? distLead.value.toFixed(1) : '—'}% del total registrado.`;
      if (metricId === 'market_sex') return `La composición es relativamente equilibrada; ${distLead?.label ?? 'el grupo líder'} representa ${distLead ? distLead.value.toFixed(1) : '—'}%.`;
      if (metricId === 'road_tdpa') return `${distLead?.label ?? 'La estación principal'} registra el mayor aforo de la muestra con ${distLead ? integer.format(distLead.value) : '—'} vehículos diarios promedio.`;
      if (metricId === 'road_mix') return `${distLead?.label ?? 'La categoría principal'} domina la composición del tránsito con ${distLead ? distLead.value.toFixed(1) : '—'}%.`;
      return `${distLead?.label ?? 'El segmento principal'} presenta el valor más alto del benchmark nacional disponible.`;
    }
    if (latestDelta === null) return 'No existe un periodo anterior comparable dentro de la base cargada para calcular una variación interanual confiable.';
    const direction = latestDelta > 1 ? 'por encima' : latestDelta < -1 ? 'por debajo' : 'prácticamente al mismo nivel';
    return `El último dato disponible se encuentra ${direction} del mismo periodo del año anterior (${pct(latestDelta,true)}).${shortMomentum === null ? '' : ` Frente al periodo inmediatamente anterior, cambia ${pct(shortMomentum,true)}.`}`;
  })();

  const overviewRows = useMemo(() => {
    const airCur = airport.filter((d:any)=>d.periodo.startsWith(String(year)));
    const airPrev = airport.filter((d:any)=>d.periodo.startsWith(String(year-1))).slice(0,airCur.length);
    const airTotal = airCur.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
    const airPrevTotal = airPrev.reduce((s:number,d:any)=>s+d.pasajeros_totales_mes_actual,0);
    const hCur = hotel.filter((d:any)=>d.periodo.startsWith(String(year))).at(-1);
    const hPrev = hCur ? hotel.find((d:any)=>d.periodo===`${year-1}-${hCur.periodo.slice(5)}`) : null;
    const cCur = cruises.filter((d:any)=>d.periodo.startsWith(String(year))).at(-1);
    const cPrev = cCur ? cruises.find((d:any)=>d.periodo===`${year-1}-${cCur.periodo.slice(5)}`) : null;
    const mCur = (enriched.markets as any)[String(year)];
    const mPrev = (enriched.markets as any)[String(year-1)];
    const mMonths = (mCur?.monthly ?? []).length;
    const mPrevComparable = (mPrev?.monthly ?? []).slice(0,mMonths).reduce((s:number,d:any)=>s+Number(d.value),0);
    const eviCur = (enriched.eviNational.monthly as any[]).filter((d:any)=>d.periodo.startsWith(String(year))).at(-1);
    const eviPrev = eviCur ? (enriched.eviNational.monthly as any[]).find((d:any)=>d.periodo===`${year-1}-${eviCur.periodo.slice(5)}`) : null;
    const topRoad = (enriched.road.stations as any[])[0];
    return [
      {group:'Demanda', metric:'Pasajeros aéreos acumulados', value:integer.format(airTotal), change:airPrevTotal?pct(changePct(airTotal,airPrevTotal)??0,true):'—', period:airCur.at(-1)?.periodo??'—', source:'OMA', family:'air' as Family, id:'air_total'},
      {group:'Alojamiento', metric:'Ocupación hotelera al corte', value:hCur?`${hCur.ocupacion_pct}%`:'—', change:hCur&&hPrev?pp(hCur.ocupacion_pct-hPrev.ocupacion_pct):'—', period:hCur?.periodo??'—', source:'DataTur', family:'hotel' as Family, id:'hotel_occ_month'},
      {group:'Demanda', metric:'Pasajeros de crucero acumulados', value:cCur?integer.format(cCur.pasajeros_acumulado_actual):'—', change:cCur&&cPrev?pct(changePct(cCur.pasajeros_acumulado_actual,cPrev.pasajeros_acumulado_actual)??0,true):'—', period:cCur?.periodo??'—', source:'DataTur/SEMAR', family:'cruise' as Family, id:'cruise_month'},
      {group:'Mercados', metric:'Entradas extranjeras', value:mCur?integer.format(mCur.total):'—', change:mCur&&mPrevComparable?pct(changePct(mCur.total,mPrevComparable)??0,true):'—', period:mMonths?`${year}-01 a ${year}-${String(mMonths).padStart(2,'0')}`:'—', source:'UPM', family:'markets' as Family, id:'market_entries'},
      {group:'Mercados', metric:'Concentración top 2 países', value:mCur?`${((mCur.countries?.[0]?.share??0)+(mCur.countries?.[1]?.share??0)).toFixed(1)}%`:'—', change:'Estructura', period:String(year), source:'UPM', family:'markets' as Family, id:'market_countries'},
      {group:'Accesibilidad', metric:'Mayor aforo carretero', value:topRoad?integer.format(topRoad.tdpa):'—', change:'TDPA', period:'2024', source:'SICT', family:'mobility' as Family, id:'road_tdpa'},
      {group:'Benchmark', metric:'Gasto medio nacional por viajero', value:eviCur?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(eviCur.avg):'—', change:eviCur&&eviPrev?pct(changePct(eviCur.avg,eviPrev.avg)??0,true):'—', period:eviCur?.periodo??'—', source:'INEGI EVI', family:'benchmark' as Family, id:'evi_avg'},
    ];
  }, [year]);

  const selectOverview = (row:{family:Family;id:string}) => { setFamily(row.family); setMetricId(row.id); setDisplay('chart'); window.scrollTo({top:160,behavior:'smooth'}); };

  return <article className="indicators-page">
    <header className="indicators-intro">
      <div>
        <span className="indicators-intro__eyebrow">INDICADORES TURÍSTICOS · MAZATLÁN</span>
        <h1>Cómo se ha comportado la actividad turística</h1>
        <p>Seleccione un tema y un indicador. La página muestra evolución, comparación, definición y advertencias metodológicas para que cada cifra se entienda antes de utilizarla.</p>
      </div>
      <aside className="indicators-audit">
        <span><i/> Base auditada</span>
        <strong>6 familias · 20 indicadores</strong>
        <small>Coberturas diferentes según fuente. Cada indicador conserva su propia unidad y periodo.</small>
      </aside>
    </header>

    <section className="indicator-filters" aria-label="Filtros de indicadores">
      <label><span>Año</span><select value={year} onChange={(e)=>onYearChange(Number(e.target.value) as ObservatoryYear)}><option value={2026}>2026</option><option value={2025}>2025</option></select></label>
      <label><span>Tema</span><select value={family} onChange={(e)=>changeFamily(e.target.value as Family)}>{(Object.keys(familyLabel) as Family[]).map((f)=><option key={f} value={f}>{familyLabel[f]}</option>)}</select></label>
      <label className="indicator-filters__metric"><span>Indicador</span><select value={metricId} onChange={(e)=>{setMetricId(e.target.value);setDisplay('chart')}}>{familyMetrics.map((m)=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
      <label><span>Lectura</span><select value={def.supportsCumulative ? viewMode : 'monthly'} disabled={!def.supportsCumulative} onChange={(e)=>onViewModeChange(e.target.value as ViewMode)}><option value="monthly">{def.frequency.includes('Semanal')?'Semanal':'Periodo'}</option><option value="cumulative">Acumulada</option></select></label>
      <label><span>Comparación</span><select value={compare?'previous':'none'} onChange={(e)=>onCompareChange(e.target.value==='previous')}><option value="previous">Año anterior</option><option value="none">Sin comparación</option></select></label>
      <label><span>Vista</span><select value={display} onChange={(e)=>setDisplay(e.target.value as Display)}><option value="chart">Gráfica</option><option value="table">Tabla</option><option value="guide">Cómo leerlo</option></select></label>
    </section>

    <section className="indicator-focus">
      <div className="indicator-focus__topline">
        <div><span>{familyLabel[family]}</span><h2>{def.label}</h2><p>{def.definition}</p></div>
        <div className="indicator-focus__value"><span>Último dato</span><strong>{currentValue}</strong><small>{currentPeriod}</small></div>
        <div className="indicator-focus__change"><span>Frente al año anterior</span><strong className={(latestDelta??0)>=0?'positive':'negative'}>{def.kind==='series' && compare && latestDelta!==null ? pct(latestDelta,true) : '—'}</strong><small>{compare ? 'mismo periodo o corte equivalente' : 'comparación desactivada'}</small></div>
      </div>

      <div className="indicator-focus__body">
        <div className="indicator-visual">
          {display === 'chart' && def.kind === 'series' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{top:18,right:20,left:0,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d9ddd9"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66706b'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10,fill:'#77807b'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>def.unit==='%'?`${v}%`:def.unit.includes('MXN')?`${Math.round(Number(v)/1000)}k`:Number(v)>=10000?`${Math.round(Number(v)/1000)}k`:String(Math.round(Number(v)))}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>formatMetric(Number(v),def)}/><Legend verticalAlign="top" height={30}/>{compare ? <Line type="monotone" dataKey="previous" name={`${year-1}`} stroke="#aeb6b1" strokeWidth={1.8} strokeDasharray="5 4" dot={false}/> : null}<Line type="monotone" dataKey="current" name={`${year}`} stroke="#174f61" strokeWidth={2.8} dot={{r:2}} activeDot={{r:4}}/></LineChart></ResponsiveContainer></ChartFrame> : null}
          {display === 'chart' && def.kind === 'distribution' ? <ChartFrame large><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} layout="vertical" margin={{top:8,right:24,left:18,bottom:0}}><CartesianGrid strokeDasharray="2 5" horizontal={false} stroke="#e0e3df"/><XAxis type="number" tick={{fontSize:10,fill:'#77807b'}} tickLine={false} axisLine={false}/><YAxis type="category" dataKey="label" width={150} tick={{fontSize:10,fill:'#4f5954'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>formatMetric(Number(v),def)}/><Bar dataKey="value" name={def.unit} fill="#174f61" radius={[0,2,2,0]}/></BarChart></ResponsiveContainer></ChartFrame> : null}

          {display === 'table' ? <div className="indicator-table-wrap"><table className="indicator-table"><thead><tr>{def.kind==='series'?<><th>Periodo</th><th>{year}</th>{compare?<th>{year-1}</th>:null}<th>Variación</th></>:<><th>Categoría</th><th>Valor</th><th>Detalle</th></>}</tr></thead><tbody>{def.kind==='series'?series.map((d)=><tr key={d.period}><td>{d.period}</td><td>{formatMetric(d.current,def)}</td>{compare?<td>{formatMetric(d.previous,def)}</td>:null}<td className={(changePct(d.current,d.previous)??0)>=0?'positive':'negative'}>{compare&&changePct(d.current,d.previous)!==null?pct(changePct(d.current,d.previous)??0,true):'—'}</td></tr>):distribution.map((d)=><tr key={d.label}><td>{d.label}</td><td>{formatMetric(d.value,def)}</td><td>{d.detail??'—'}</td></tr>)}</tbody></table></div> : null}

          {display === 'guide' ? <div className="indicator-guide">
            <h3>Cómo leer este indicador</h3>
            <p className="indicator-guide__lead">{interpretation}</p>
            <div className="indicator-guide__grid"><div><span>Qué mide</span><p>{def.definition}</p></div><div><span>Qué no mide</span><p>{def.caution}</p></div><div><span>Unidad</span><p>{def.unit}</p></div><div><span>Frecuencia</span><p>{def.frequency}</p></div></div>
          </div> : null}
        </div>

        <aside className="indicator-reading">
          <div className="indicator-reading__summary"><span>Lectura del comportamiento</span><p>{interpretation}</p></div>
          {def.kind==='series' ? <dl>
            <div><dt>Máximo del periodo</dt><dd>{peak?`${formatMetric(peak.current,def)} · ${peak.period}`:'—'}</dd></div>
            <div><dt>Mínimo del periodo</dt><dd>{low?`${formatMetric(low.current,def)} · ${low.period}`:'—'}</dd></div>
            <div><dt>Cambio vs periodo previo</dt><dd className={(shortMomentum??0)>=0?'positive':'negative'}>{shortMomentum!==null?pct(shortMomentum,true):'—'}</dd></div>
          </dl> : <dl><div><dt>Categoría líder</dt><dd>{distLead?.label??'—'}</dd></div><div><dt>Valor líder</dt><dd>{formatMetric(distLead?.value,def)}</dd></div><div><dt>Categorías mostradas</dt><dd>{distribution.length}</dd></div></dl>}
          <div className="indicator-reading__meta"><div><span>Fuente</span><strong>{def.source}</strong></div><div><span>Cobertura</span><strong>{def.coverage}</strong></div><div><span>Frecuencia</span><strong>{def.frequency}</strong></div></div>
          <div className="indicator-reading__warning"><strong>Importante</strong><p>{def.caution}</p></div>
        </aside>
      </div>
    </section>

    <section className="indicator-catalogue">
      <header><div><span>RESUMEN</span><h2>Indicadores principales del destino</h2><p>Haga clic en cualquier fila para abrirla arriba con su definición, evolución y comparación.</p></div><button onClick={onOpenInsights}>Ver brief ejecutivo</button></header>
      <div className="indicator-catalogue__table">
        <div className="indicator-catalogue__head"><span>Área</span><span>Indicador</span><span>Valor</span><span>Variación / lectura</span><span>Periodo</span><span>Fuente</span></div>
        {overviewRows.map((r)=><button key={r.metric} className="indicator-catalogue__row" onClick={()=>selectOverview(r)}><span>{r.group}</span><strong>{r.metric}</strong><b>{r.value}</b><span>{r.change}</span><span>{r.period}</span><span>{r.source}</span></button>)}
      </div>
    </section>

    <section className="indicator-audit-section">
      <details open><summary>Qué tan confiable y comparable es cada fuente</summary><div className="indicator-quality-grid">{(enriched.quality as any[]).map((q:any)=><div key={q.topic}><strong>{q.topic}</strong><span>{q.status}</span><small>{q.coverage}</small><p>{q.note}</p></div>)}</div></details>
      <details><summary>Discrepancias que no deben ocultarse</summary><div className="indicator-discrepancies">{(enriched.discrepancies as any[]).map((d:any)=><div key={d.topic}><strong>{d.topic}</strong><p><b>Fuente primaria:</b> {d.primary}</p><p><b>Otra referencia:</b> {d.secondary}</p><small>{d.note}</small></div>)}</div></details>
    </section>

    <section className="indicator-next"><span>¿Necesita análisis sectorial?</span><div><button onClick={onOpenBusiness}>Aplicar a empresas y comercio</button><button onClick={onOpenHotel}>Aplicar a hotelería</button><button onClick={onOpenAirport}>Detalle aeroportuario</button></div></section>
  </article>;
}
