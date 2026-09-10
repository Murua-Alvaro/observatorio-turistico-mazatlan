import { AlertTriangle, ArrowRight, BedDouble, Building2, Globe2, Plane, Ship, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { airport, cruises, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';

type Props = {
  year: ObservatoryYear;
  onNavigate: (tab: 'business' | 'hotel' | 'airport' | 'cruises' | 'markets') => void;
};

type Audience = 'business' | 'hotel';

export function Insights({ year, onNavigate }: Props) {
  const [audience, setAudience] = useState<Audience>('business');
  const prefix = String(year);

  const air = airport.filter((d: any) => d.periodo.startsWith(prefix));
  const airPrev = airport.filter((d: any) => d.periodo.startsWith(String(year - 1))).slice(0, air.length);
  const hotelYear = hotel.filter((d: any) => d.periodo.startsWith(prefix));
  const cruisesYear = cruises.filter((d: any) => d.periodo.startsWith(prefix));
  const latestAir = air.at(-1);
  const latestHotel = hotelYear.at(-1);
  const latestCruise = cruisesYear.at(-1);

  const airYtd = air.reduce((sum: number, d: any) => sum + d.pasajeros_totales_mes_actual, 0);
  const airPrevYtd = airPrev.reduce((sum: number, d: any) => sum + d.pasajeros_totales_mes_actual, 0);
  const airYoy = airPrevYtd ? ((airYtd / airPrevYtd) - 1) * 100 : latestAir?.yoy_total_pct ?? 0;

  const sameCutPrevHotel = latestHotel ? hotel.find((d: any) => d.periodo === `${year - 1}-${latestHotel.periodo.slice(5)}`) : null;
  const hotelDelta = sameCutPrevHotel && latestHotel ? latestHotel.ocupacion_pct - sameCutPrevHotel.ocupacion_pct : null;

  const cruisePrev = latestCruise ? cruises.find((d: any) => d.periodo === `${year - 1}-${latestCruise.periodo.slice(5)}`) : null;
  const cruiseYoy = cruisePrev && latestCruise ? ((latestCruise.pasajeros_acumulado_actual / cruisePrev.pasajeros_acumulado_actual) - 1) * 100 : null;

  const countries = useMemo(() => data.nationality.countries
    .filter((d: any) => Number(d.anio) === year)
    .sort((a: any, b: any) => b.valor_entradas - a.valor_entradas), [year]);
  const foreignTotal = countries.reduce((sum: number, d: any) => sum + d.valor_entradas, 0);
  const top2Share = foreignTotal ? countries.slice(0, 2).reduce((sum: number, d: any) => sum + d.valor_entradas, 0) / foreignTotal * 100 : 0;

  const hotelFirst = hotelYear.at(0);
  const capacityChange = hotelFirst && latestHotel ? ((latestHotel.cuartos_disponibles_promedio_diario / hotelFirst.cuartos_disponibles_promedio_diario) - 1) * 100 : 0;

  const actions = audience === 'business' ? [
    { title: 'Calendarizar campañas con el pulso de llegada', text: 'Use los meses de mayor conectividad para sincronizar promociones, horarios y abasto. No confunda pasajeros con ventas; úselo como señal adelantada.', action: 'Abrir empresas y comercio', tab: 'business' as const },
    { title: 'Reducir dependencia de dos mercados internacionales', text: `Los dos principales mercados concentran ${top2Share.toFixed(1)}% del flujo extranjero registrado. Conviene diversificar promoción y alianzas.`, action: 'Abrir mercados', tab: 'markets' as const },
    { title: 'Separar el flujo de cruceros del hotelero', text: 'El crucerista tiene una lógica de consumo de corta estancia distinta; úselo para comercio, tours y servicios de alta rotación.', action: 'Abrir cruceros', tab: 'cruises' as const },
  ] : [
    { title: 'Comparar ocupación sólo a cortes equivalentes', text: hotelDelta === null ? 'La base no permite una comparación equivalente para este año.' : `El último corte disponible cambia ${pp(hotelDelta)} frente al mismo corte del año anterior.`, action: 'Abrir sector hotelero', tab: 'hotel' as const },
    { title: 'Leer capacidad junto con ocupación', text: `La capacidad reportada cambia ${pct(capacityChange, true)} entre el primer y último corte disponible de ${year}.`, action: 'Abrir sector hotelero', tab: 'hotel' as const },
    { title: 'Usar conectividad como señal, no como ocupación', text: `El flujo aéreo acumulado cambia ${pct(airYoy, true)}. Es contexto de demanda potencial, no noches-habitación.`, action: 'Abrir aeropuerto', tab: 'airport' as const },
  ];

  return <>
    <SectionHeader kicker="Centro de hallazgos" title="Señales que requieren decisión, no sólo visualización" description="Una capa interpretativa sobre los indicadores disponibles. Cada hallazgo conserva su fuente y distingue señal, riesgo e implicación operativa." />

    <div className="insight-toolbar">
      <div className="segmented segmented--strong"><button className={audience === 'business' ? 'active' : ''} onClick={() => setAudience('business')}><Building2 size={14}/> Empresas y comercio</button><button className={audience === 'hotel' ? 'active' : ''} onClick={() => setAudience('hotel')}><BedDouble size={14}/> Sector hotelero</button></div>
      <span className="context-chip">Lectura {year}</span>
    </div>

    <div className="insight-grid">
      <article className={`insight-card ${airYoy < 0 ? 'insight-card--risk' : 'insight-card--positive'}`}><div className="insight-card__icon"><Plane size={18}/></div><span>Conectividad aérea</span><strong>{pct(airYoy, true)}</strong><p>{airYoy < 0 ? 'El acumulado sigue por debajo del mismo tramo del año anterior.' : 'El acumulado supera el mismo tramo del año anterior.'}</p><button onClick={() => onNavigate('airport')}>Ver evidencia <ArrowRight size={14}/></button></article>
      <article className="insight-card insight-card--positive"><div className="insight-card__icon"><BedDouble size={18}/></div><span>Hotelería</span><strong>{latestHotel ? `${latestHotel.ocupacion_pct}%` : '—'}</strong><p>{hotelDelta === null ? 'Sin comparación equivalente disponible.' : `${pp(hotelDelta)} frente al mismo corte previo.`}</p><button onClick={() => onNavigate('hotel')}>Ver operación <ArrowRight size={14}/></button></article>
      <article className="insight-card insight-card--accent"><div className="insight-card__icon"><Ship size={18}/></div><span>Cruceros</span><strong>{cruiseYoy === null ? '—' : pct(cruiseYoy, true)}</strong><p>{latestCruise ? `${integer.format(latestCruise.pasajeros_acumulado_actual)} pasajeros acumulados al último corte.` : 'Sin datos para el periodo.'}</p><button onClick={() => onNavigate('cruises')}>Ver cruceros <ArrowRight size={14}/></button></article>
      <article className="insight-card"><div className="insight-card__icon"><Globe2 size={18}/></div><span>Concentración de mercados</span><strong>{top2Share.toFixed(1)}%</strong><p>Participación de los dos principales mercados de origen dentro del flujo extranjero registrado.</p><button onClick={() => onNavigate('markets')}>Ver mercados <ArrowRight size={14}/></button></article>
    </div>

    <section className="decision-room">
      <div className="decision-room__head"><div><span className="eyebrow">Qué hacer con la señal</span><h3>{audience === 'business' ? 'Agenda para cámaras y empresas' : 'Agenda para operación hotelera'}</h3></div><div className="decision-room__badge"><TrendingUp size={15}/> 3 acciones prioritarias</div></div>
      <div className="decision-room__list">{actions.map((item, i) => <article key={item.title}><span className="decision-index">0{i + 1}</span><div><strong>{item.title}</strong><p>{item.text}</p></div><button onClick={() => onNavigate(item.tab)}>{item.action}<ArrowRight size={14}/></button></article>)}</div>
    </section>

    <div className="method-alert"><AlertTriangle size={17}/><div><strong>Regla del observatorio</strong><p>Los hallazgos orientan decisiones, pero no convierten señales de conectividad, movilidad o entradas migratorias en estimaciones no observadas de ventas, turistas únicos o derrama local.</p></div></div>
  </>;
}
