import { Database, ShieldCheck } from 'lucide-react';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { data } from '../data/model';

const names: Record<string,string> = { airport:'Aeropuerto', hotelMonthly:'Hotelería mensual', hotelWeekly:'Hotelería semanal', cruises:'Cruceros', nationality:'Nacionalidad', road:'Vialidad', evi:'EVI nacional' };

export function Methodology() {
  return <>
    <SectionHeader kicker="Gobernanza de datos" title="Fuentes, cobertura y límites de interpretación" description="Cada indicador se presenta con escala, frecuencia y alcance explícitos. La aplicación no rellena meses faltantes ni transforma benchmarks nacionales en cifras locales." />
    <div className="source-grid">{data.methodology.map((m:any)=><article className="source-card" key={m.title}><div className="source-card__icon"><Database size={19}/></div><h3>{m.title}</h3><p>{m.text}</p></article>)}</div>
    <Panel title="Cobertura disponible" subtitle={`Auditoría ejecutada al ${data.meta.cutoff}`}><div className="coverage-list">{Object.entries(data.meta.coverage).map(([key,value])=><div className="coverage" key={key}><span>{names[key] ?? key}</span><strong>{String(value)}</strong></div>)}</div></Panel>
    <div className="callout callout--method"><ShieldCheck size={20}/><div><strong>Trazabilidad</strong><p>Las tablas limpias conservan el nombre del archivo fuente. Los números del portal se construyen únicamente a partir del directorio auditado de datos limpios.</p></div></div>
  </>;
}
