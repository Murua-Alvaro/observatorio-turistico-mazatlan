import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { integer, pct, pp } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';
import { airportIntelligence, hotelIntelligence, marketIntelligence } from '../lib/intelligence';

type Props = {
  year: ObservatoryYear;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

type Focus = 'performance' | 'capacity' | 'demand';

export function Hotel({ year, compare, onNavigate }: Props) {
  const [focus, setFocus] = useState<Focus>('performance');
  const hotel = hotelIntelligence(year);
  const air = airportIntelligence(year);
  const market = marketIntelligence(year);

  const capacityText = hotel.capacityGrowth === null ? '—' : pct(hotel.capacityGrowth, true);
  const occupiedText = hotel.occupiedGrowth === null ? '—' : pct(hotel.occupiedGrowth, true);
  const absorptionText = hotel.absorptionSpread === null ? '—' : `${hotel.absorptionSpread.toFixed(1)} pp`;

  return <section className="dataset-page sector-page">
    <header className="dataset-heading dataset-heading--editorial">
      <div><span>Hotelería · {year}</span><h1>Desempeño, oferta y capacidad de absorción</h1><p>El módulo compara cortes equivalentes para responder si la ocupación mejora porque hay más demanda, más oferta, o ambas cosas al mismo tiempo.</p></div>
      <div className="dataset-heading__links"><button onClick={() => onNavigate('markets')}>Mercados</button><button onClick={() => onNavigate('airport')}>Aeropuerto</button><button onClick={() => onNavigate('insights')}>Brief ejecutivo</button></div>
    </header>

    <section className="hotel-benchmark">
      <div className="hotel-benchmark__head"><span>Indicador</span><span>{year - 1} · mismo corte</span><span>{year}</span><span>Cambio</span><span>Lectura</span></div>
      <div><strong>Ocupación</strong><span>{hotel.sameCutPrevious ? `${hotel.sameCutPrevious.ocupacion_pct}%` : '—'}</span><b>{hotel.latest ? `${hotel.latest.ocupacion_pct}%` : '—'}</b><span className={(hotel.occupancyDelta ?? 0) >= 0 ? 'positive' : 'negative'}>{compare && hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : '—'}</span><p>Comparación directa a corte equivalente.</p></div>
      <div><strong>Cuartos disponibles</strong><span>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_disponibles_promedio_diario) : '—'}</span><b>{hotel.latest ? integer.format(hotel.latest.cuartos_disponibles_promedio_diario) : '—'}</b><span>{capacityText}</span><p>Expansión o contracción de la oferta formal reportada.</p></div>
      <div><strong>Cuartos ocupados</strong><span>{hotel.sameCutPrevious ? integer.format(hotel.sameCutPrevious.cuartos_ocupados) : '—'}</span><b>{hotel.latest ? integer.format(hotel.latest.cuartos_ocupados) : '—'}</b><span className={(hotel.occupiedGrowth ?? 0) >= 0 ? 'positive' : 'negative'}>{occupiedText}</span><p>Permite ver si la demanda absorbió el cambio de capacidad.</p></div>
    </section>

    <section className="hotel-conclusion">
      <div><span>Señal de absorción</span><strong>{absorptionText}</strong></div>
      <p>{hotel.absorptionSpread !== null && hotel.absorptionSpread > 0 ? `Los cuartos ocupados están creciendo ${absorptionText} más rápido que la oferta disponible al corte comparable. Esto es una señal operativa favorable para absorción, aunque no sustituye ADR o RevPAR.` : 'La oferta está creciendo al mismo ritmo o más rápido que los cuartos ocupados; conviene vigilar presión competitiva y precios.'}</p>
    </section>

    <div className="section-switcher">
      <label><span>Vista hotelera</span><select value={focus} onChange={(e) => setFocus(e.target.value as Focus)}><option value="performance">Desempeño y ocupación</option><option value="capacity">Capacidad y absorción</option><option value="demand">Contexto de demanda</option></select></label>
      <span>DataTur publica cortes acumulados al mes; se comparan cortes equivalentes.</span>
    </div>

    {focus === 'performance' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Desempeño</span><h2>Trayectoria de ocupación acumulada</h2></div><small>Fuente: DataTur</small></div>
      <div className="analysis-block__grid">
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotel.current} margin={{top:12,right:16,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d9dfe3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación" stroke="#1769aa" strokeWidth={2.5} dot={{r:2.2}}/></LineChart></ResponsiveContainer></ChartFrame>
        <div className="fact-sheet"><div><span>Último corte</span><strong>{hotel.latest?.periodo ?? '—'}</strong></div><div><span>Ocupación</span><strong>{hotel.latest ? `${hotel.latest.ocupacion_pct}%` : '—'}</strong></div><div><span>Variación interanual</span><strong>{hotel.occupancyDelta !== null ? pp(hotel.occupancyDelta) : '—'}</strong></div><div><span>Cuartos ocupados</span><strong>{hotel.latest ? integer.format(hotel.latest.cuartos_ocupados) : '—'}</strong></div><p>La lectura correcta es acumulada al corte. No se debe promediar enero, febrero, marzo, etc. como si fueran tasas mensuales independientes.</p></div>
      </div>
    </section> : null}

    {focus === 'capacity' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Oferta formal</span><h2>Capacidad disponible y absorción</h2></div></div>
      <div className="analysis-block__grid">
        <ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotel.current} margin={{top:12,right:16,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d9dfe3"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66717a'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Disponibles" stroke="#1769aa" strokeWidth={2.4} fill="#e9f1f8"/><Area type="monotone" dataKey="cuartos_ocupados" name="Ocupados" stroke="#0b7a60" strokeWidth={2.2} fill="#e9f4ef"/></AreaChart></ResponsiveContainer></ChartFrame>
        <div className="capacity-ledger"><div><span>Crecimiento de oferta</span><strong>{capacityText}</strong></div><div><span>Crecimiento de ocupados</span><strong>{occupiedText}</strong></div><div><span>Diferencial de absorción</span><strong>{absorptionText}</strong></div><p>Cuando los cuartos ocupados crecen más rápido que la oferta, la expansión de capacidad está siendo absorbida con mayor intensidad. Para revenue management faltan ADR y RevPAR, que deben integrarse como siguiente capa.</p></div>
      </div>
    </section> : null}

    {focus === 'demand' ? <section className="analysis-block">
      <div className="analysis-block__head"><div><span>Contexto de demanda</span><h2>Señales externas que importan al hotelero</h2></div></div>
      <div className="demand-ledger">
        <div><strong>Pasajeros aéreos</strong><b>{integer.format(air.total)}</b><span className={air.yoy >= 0 ? 'positive' : 'negative'}>{pct(air.yoy, true)}</span><p>Conectividad terminal acumulada; no equivale a noches-habitación.</p><button onClick={() => onNavigate('airport')}>Abrir aeropuerto</button></div>
        <div><strong>Pasajeros internacionales</strong><b>{integer.format(air.international)}</b><span>{air.internationalShare.toFixed(1)}% del total aéreo</span><p>Sirve para dimensionar exposición a mercados no nacionales.</p><button onClick={() => onNavigate('airport')}>Ver mezcla</button></div>
        <div><strong>Entradas extranjeras</strong><b>{integer.format(market.total)}</b><span>{market.top2Share.toFixed(1)}% top 2</span><p>La concentración internacional es alta; promoción y alianzas dependen mucho de pocos mercados.</p><button onClick={() => onNavigate('markets')}>Ver mercados</button></div>
      </div>
      <div className="market-analysis-layout market-analysis-layout--hotel"><div className="market-table market-table--shares"><div className="market-table__head"><span>#</span><span>Mercado</span><span>Entradas</span><span>Participación</span></div>{market.countries.slice(0, 8).map((d:any, i:number) => { const share = market.total ? d.valor_entradas / market.total * 100 : 0; return <div className="market-table__row" key={d.pais}><span>{String(i + 1).padStart(2, '0')}</span><strong>{d.pais}</strong><b>{integer.format(d.valor_entradas)}</b><div className="share-cell"><span>{share.toFixed(1)}%</span><i style={{width:`${share}%`}}/></div></div>; })}</div><aside className="analysis-notes"><h3>Implicación hotelera</h3><p>Una estructura internacional tan concentrada hace que cambios de conectividad, percepción o poder adquisitivo en Canadá y Estados Unidos puedan mover con fuerza la demanda externa.</p><dl><div><dt>Top 2</dt><dd>{market.top2Share.toFixed(1)}%</dd></div><div><dt>Top 5</dt><dd>{market.top5Share.toFixed(1)}%</dd></div><div><dt>HHI</dt><dd>{market.hhi.toFixed(0)}</dd></div></dl></aside></div>
    </section> : null}
  </section>;
}
