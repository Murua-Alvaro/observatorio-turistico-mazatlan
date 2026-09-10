import { Anchor, Building2, CalendarDays, CarFront, Globe2, Plane } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Metric } from '../components/Metric';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { airport, busiestRoads, data, topCountries2026 } from '../data/model';
import { integer, pct } from '../lib/format';

const airport2026 = airport.filter((d: any) => d.periodo.startsWith('2026'));
const peakMonths = [...airport2026]
  .sort((a: any, b: any) => b.pasajeros_totales_mes_actual - a.pasajeros_totales_mes_actual)
  .slice(0, 3);

export function Business() {
  const marketConcentration = data.kpis.canadaShare + data.kpis.usaShare;

  return <>
    <SectionHeader
      kicker="Inteligencia empresarial"
      title="Demanda turística para comercio, servicios y cámaras empresariales"
      description="Una lectura ejecutiva del flujo que llega a Mazatlán, su origen y su estacionalidad. Los indicadores se mantienen separados por fuente para evitar convertir aforos, pasajeros o entradas migratorias en una sola cifra artificial."
    />

    <div className="audience-banner audience-banner--business">
      <div><span>Uso recomendado</span><strong>Planeación comercial · promoción · logística · calendario de demanda</strong></div>
      <div className="audience-banner__chips"><span>CANACO</span><span>Comercio</span><span>Servicios</span><span>Promoción</span></div>
    </div>

    <div className="metric-grid">
      <Metric eyebrow="Llegada aérea ene–ago 2026" value={integer.format(data.kpis.airportYtd)} change={pct(data.kpis.airportYtdYoY, true)} changeTone="negative" detail="pasajeros terminales · OMA" icon={<Plane size={18}/>} />
      <Metric eyebrow="Cruceros ene–jul 2026" value={integer.format(data.kpis.cruisePaxYtd)} change={pct(data.kpis.cruisePaxYtdYoY, true)} changeTone="positive" detail="pasajeros · DataTur / SEMAR" icon={<Anchor size={18}/>} />
      <Metric eyebrow="Entradas extranjeras" value={integer.format(data.kpis.foreignEntriesYtd)} detail="ene–jun 2026 · UPM/DataTur" icon={<Globe2 size={18}/>} />
      <Metric eyebrow="Aforo vial máximo" value={integer.format(data.kpis.roadMaxTdpa)} detail="vehículos/día · estación SICT" icon={<CarFront size={18}/>} />
    </div>

    <div className="executive-grid">
      <Panel title="Ritmo de demanda aérea 2026" subtitle="Pasajeros terminales mensuales · lectura de intensidad comercial">
        <ChartFrame large>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airport2026} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dfe4df" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#66716c' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#66716c' }} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))} />
              <Bar dataKey="pasajeros_totales_mes_actual" name="Pasajeros" fill="#1b7466" radius={[7,7,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <section className="decision-board">
        <div className="decision-board__eyebrow">Lectura para decisión</div>
        <h3>Qué significa para empresas</h3>
        <article><span className="decision-index">01</span><div><strong>La recuperación aérea es reciente.</strong><p>El acumulado sigue {pct(data.kpis.airportYtdYoY)} frente a 2025, pero julio y agosto regresaron a variaciones positivas. Conviene distinguir tendencia anual de recuperación de corto plazo.</p></div></article>
        <article><span className="decision-index">02</span><div><strong>El canal marítimo está acelerando.</strong><p>Los pasajeros de crucero crecen {pct(data.kpis.cruisePaxYtdYoY, true)} al corte de julio; es un flujo distinto al hotelero y útil para comercio de corta estancia.</p></div></article>
        <article><span className="decision-index">03</span><div><strong>El mercado extranjero está concentrado.</strong><p>Canadá y Estados Unidos representan {marketConcentration.toFixed(1)}% de las entradas aéreas extranjeras registradas en 2026 al corte.</p></div></article>
      </section>
    </div>

    <div className="split-grid">
      <Panel title="Meses de mayor intensidad aérea" subtitle="Top 3 dentro de los meses disponibles de 2026">
        <div className="priority-list">
          {peakMonths.map((d:any, i:number)=><article key={d.periodo}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{d.label}</strong><small>{integer.format(d.pasajeros_totales_mes_actual)} pasajeros</small></div><b>{pct(d.yoy_total_pct, true)}</b></article>)}
        </div>
        <div className="micro-note"><CalendarDays size={15}/><span>Útil para calendarizar inventarios, campañas y personal; no equivale a ventas del comercio.</span></div>
      </Panel>

      <Panel title="Mercados internacionales prioritarios" subtitle="Entradas registradas por nacionalidad · enero–junio 2026">
        <div className="ranking ranking--clean">{topCountries2026.slice(0,6).map((d:any,i:number)=><div className="rank" key={d.pais}><span className="rank__number">{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><span>{integer.format(d.valor_entradas)} entradas</span></div><div className="rank__bar"><span style={{width:`${Math.max(4,d.valor_entradas/topCountries2026[0].valor_entradas*100)}%`}}/></div></div>)}</div>
      </Panel>
    </div>

    <div className="split-grid">
      <Panel title="Accesibilidad terrestre" subtitle="Estaciones SICT con mayor tránsito diario promedio">
        <div className="road-list">{busiestRoads.slice(0,5).map((d:any)=><article key={`${d.estacion}-${d.tdpa}`}><div><strong>{d.estacion}</strong><small>{d.carretera}</small></div><b>{integer.format(d.tdpa)}</b><span>TDPA</span></article>)}</div>
      </Panel>
      <Panel title="Aplicaciones para cámaras empresariales" subtitle="Qué decisiones puede apoyar la información disponible">
        <div className="use-cases">
          <article><Building2 size={18}/><div><strong>Planeación de temporada</strong><p>Identificar ventanas de mayor presión de llegada para campañas, horarios y coordinación sectorial.</p></div></article>
          <article><Globe2 size={18}/><div><strong>Promoción por mercado</strong><p>Priorizar comunicación e iniciativas comerciales según composición internacional observada.</p></div></article>
          <article><CarFront size={18}/><div><strong>Logística y accesibilidad</strong><p>Incorporar intensidad de corredores carreteros como contexto de flujo regional y abastecimiento.</p></div></article>
        </div>
      </Panel>
    </div>
  </>;
}
