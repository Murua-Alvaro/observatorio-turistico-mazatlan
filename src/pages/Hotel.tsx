import { ArrowRight, BedDouble, Building2, Download, Globe2, Plane, ShieldCheck } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { airport, data, hotel } from '../data/model';
import { integer, pct, pp } from '../lib/format';
import { downloadObservatoryCsv, type ObservatoryYear } from '../lib/export';

type Props = {
  year: ObservatoryYear;
  compare: boolean;
  onNavigate: (tab: 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology') => void;
};

export function Hotel({ year, compare, onNavigate }: Props) {
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
    <header className="page-intro">
      <div><span className="page-kicker">HOTELERÍA</span><h1>Desempeño, capacidad y contexto de demanda</h1><p>Una vista operativa para hoteles, asociaciones e inversión. La ocupación se compara a cortes equivalentes y se interpreta junto con la oferta formal y la conectividad.</p></div>
      <div className="page-intro__actions"><button onClick={() => onNavigate('markets')}><Globe2 size={15}/> Mercados</button><button onClick={() => onNavigate('airport')}><Plane size={15}/> Aeropuerto</button><button onClick={() => downloadObservatoryCsv(year)}><Download size={15}/> CSV</button></div>
    </header>

    <dl className="stat-strip">
      <div><dt><BedDouble size={15}/> Ocupación al corte</dt><dd>{latest ? `${latest.ocupacion_pct}%` : '—'}</dd><span className={hotelDelta !== null && hotelDelta >= 0 ? 'positive' : hotelDelta !== null ? 'negative' : ''}>{compare && hotelDelta !== null ? pp(hotelDelta) : latest?.periodo ?? '—'}</span></div>
      <div><dt><Building2 size={15}/> Cuartos disponibles</dt><dd>{latest ? integer.format(latest.cuartos_disponibles_promedio_diario) : '—'}</dd><span className={capacityGrowth >= 0 ? 'positive' : 'negative'}>{pct(capacityGrowth, true)} primer→último corte</span></div>
      <div><dt><BedDouble size={15}/> Cuartos ocupados</dt><dd>{latest ? integer.format(latest.cuartos_ocupados) : '—'}</dd><span>DataTur</span></div>
      <div><dt><Plane size={15}/> Pasajeros internacionales</dt><dd>{integer.format(intlYtd)}</dd><span>OMA · {year}</span></div>
    </dl>

    <div className="method-line"><ShieldCheck size={16}/><span><strong>Regla de lectura:</strong> los valores de ocupación publicados por DataTur son cortes acumulados al mes. Junio se compara con junio; no se promedian los cortes como meses independientes.</span></div>

    <details className="analysis-section" open>
      <summary><div><span>01</span><strong>Desempeño hotelero</strong><small>Ocupación acumulada al corte</small></div></summary>
      <div className="analysis-section__body analysis-grid">
        <div className="analysis-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><LineChart data={hotelYear} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d7ddd9"/><XAxis dataKey="label" tick={{fontSize:10,fill:'#626d68'}} tickLine={false} axisLine={false}/><YAxis domain={[30,70]} tickFormatter={(v:any)=>`${v}%`} tick={{fontSize:10,fill:'#626d68'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="ocupacion_pct" name="Ocupación acumulada" stroke="#2d5e88" strokeWidth={2.4} dot={{ r: 2.2, fill: '#fff' }}/></LineChart></ResponsiveContainer></ChartFrame></div>
        <aside className="analysis-notes"><h3>Lectura operativa</h3><p>{hotelDelta === null ? 'No existe comparación equivalente en la base para este corte.' : `${pp(hotelDelta)} frente al mismo corte del año anterior.`}</p><dl><div><dt>Último corte</dt><dd>{latest?.periodo ?? '—'}</dd></div><div><dt>Fuente</dt><dd>DataTur</dd></div><div><dt>Alcance</dt><dd>Acumulado al mes</dd></div></dl><button onClick={() => onNavigate('insights')}>Ver hallazgos <ArrowRight size={13}/></button></aside>
      </div>
    </details>

    <details className="analysis-section" open>
      <summary><div><span>02</span><strong>Capacidad formal</strong><small>Oferta reportada y cambio dentro del año</small></div></summary>
      <div className="analysis-section__body analysis-grid">
        <div className="analysis-chart"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={hotelYear} margin={{top:10,right:10,left:-8,bottom:0}}><CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#d7ddd9"/><XAxis dataKey="label" tick={{fontSize:10,fill:'#626d68'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10,fill:'#626d68'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area type="monotone" dataKey="cuartos_disponibles_promedio_diario" name="Cuartos disponibles" stroke="#2d5e88" strokeWidth={2.3} fill="#e5ebf0"/></AreaChart></ResponsiveContainer></ChartFrame></div>
        <aside className="analysis-notes"><h3>Capacidad y absorción</h3><p>La ocupación sólo tiene sentido junto con la oferta disponible. Entre el primer y el último corte de {year}, la capacidad reportada cambia {pct(capacityGrowth, true)}.</p><dl><div><dt>Primer corte</dt><dd>{first ? integer.format(first.cuartos_disponibles_promedio_diario) : '—'}</dd></div><div><dt>Último corte</dt><dd>{latest ? integer.format(latest.cuartos_disponibles_promedio_diario) : '—'}</dd></div></dl></aside>
      </div>
    </details>

    <details className="analysis-section">
      <summary><div><span>03</span><strong>Contexto de demanda</strong><small>Aéreo, mercado internacional y hotelería sin sumarlos</small></div></summary>
      <div className="analysis-section__body">
        <div className="channel-table">
          <div><span>Aéreo</span><strong>{integer.format(airYtd)}</strong><small>pasajeros terminales</small><button onClick={() => onNavigate('airport')}>Abrir</button></div>
          <div><span>Mercado extranjero</span><strong>{integer.format(foreignTotal)}</strong><small>entradas registradas</small><button onClick={() => onNavigate('markets')}>Abrir</button></div>
          <div><span>Ocupación</span><strong>{latest ? `${latest.ocupacion_pct}%` : '—'}</strong><small>corte acumulado</small><button onClick={() => onNavigate('methodology')}>Metodología</button></div>
        </div>
        <p className="section-caption">Estas señales describen poblaciones diferentes. Se usan para contextualizar demanda potencial, no para producir una cifra de “turistas totales”.</p>
      </div>
    </details>

    <details className="analysis-section">
      <summary><div><span>04</span><strong>Mercados internacionales</strong><small>Entradas por nacionalidad · {year}</small></div><button className="summary-action" onClick={(e) => { e.preventDefault(); onNavigate('markets'); }}>Explorar mercados</button></summary>
      <div className="analysis-section__body"><div className="market-table"><div className="market-table__head"><span>Pos.</span><span>País</span><span>Entradas</span><span>Participación relativa</span></div>{countries.slice(0,10).map((d:any,i:number)=><div className="market-table__row" key={d.pais}><span>{String(i+1).padStart(2,'0')}</span><strong>{d.pais}</strong><b>{integer.format(d.valor_entradas)}</b><div className="market-meter"><i style={{width:`${Math.max(3,d.valor_entradas/(countries[0]?.valor_entradas || 1)*100)}%`}}/></div></div>)}</div></div>
    </details>

    <details className="analysis-section">
      <summary><div><span>05</span><strong>Tabla hotelera</strong><small>Serie completa del año seleccionado</small></div></summary>
      <div className="analysis-section__body"><div className="table-wrap"><table><thead><tr><th>Corte</th><th>Disponibles</th><th>Ocupados</th><th>Ocupación</th><th>Alcance</th></tr></thead><tbody>{[...hotelYear].reverse().map((d:any)=><tr key={d.periodo}><td>{d.periodo}</td><td>{integer.format(d.cuartos_disponibles_promedio_diario)}</td><td>{integer.format(d.cuartos_ocupados)}</td><td>{d.ocupacion_pct}%</td><td><span className="tag">Acumulado al mes</span></td></tr>)}</tbody></table></div></div>
    </details>
  </>;
}
