import { ExternalLink, MapPin } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { data } from './data/model';
import { Airport } from './pages/Airport';
import { Cruises } from './pages/Cruises';
import { Hotel } from './pages/Hotel';
import { Markets } from './pages/Markets';
import { Methodology } from './pages/Methodology';
import { Mobility } from './pages/Mobility';
import { Panorama } from './pages/Panorama';

type Tab = 'panorama' | 'aeropuerto' | 'hoteleria' | 'cruceros' | 'mercados' | 'movilidad' | 'metodologia';
const nav: Array<{ id: Tab; label: string }> = [
  { id: 'panorama', label: 'Panorama' },
  { id: 'aeropuerto', label: 'Aeropuerto' },
  { id: 'hoteleria', label: 'Hotelería' },
  { id: 'cruceros', label: 'Cruceros' },
  { id: 'mercados', label: 'Mercados' },
  { id: 'movilidad', label: 'Movilidad' },
  { id: 'metodologia', label: 'Fuentes' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('panorama');
  const pages: Record<Tab, ReactNode> = {
    panorama: <Panorama onOpenAirport={() => setTab('aeropuerto')} />,
    aeropuerto: <Airport />,
    hoteleria: <Hotel />,
    cruceros: <Cruises />,
    mercados: <Markets />,
    movilidad: <Mobility />,
    metodologia: <Methodology />,
  };

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setTab('panorama')}><span className="brand__mark">MZT</span><span className="brand__text"><strong>Observatorio Turístico</strong><small>Mazatlán · Sinaloa</small></span></button><div className="topbar__meta"><span className="status-dot"/>Datos auditados · corte {data.meta.cutoff}</div></header>
    <nav className="nav" aria-label="Secciones del observatorio">{nav.map((item)=><button key={item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}>{item.label}</button>)}</nav>
    <main>{tab === 'panorama' && <section className="hero"><div className="hero__copy"><span className="hero__kicker"><MapPin size={14}/> Mazatlán, Sinaloa</span><h1>Actividad turística, <em>leída con contexto.</em></h1><p>Seguimiento de conectividad, alojamiento, cruceros y mercados de origen sin confundir pasajeros, turistas, frecuencias ni escalas geográficas.</p></div><div className="hero__stamp"><span>Periodo principal</span><strong>2025 — 2026</strong><small>Actualización según disponibilidad oficial</small></div></section>}<div className="content">{pages[tab]}</div></main>
    <footer><div><strong>Observatorio Turístico de Mazatlán</strong><span>Infraestructura analítica independiente · datos públicos auditados</span></div><button onClick={()=>setTab('metodologia')}>Ver metodología <ExternalLink size={14}/></button></footer>
  </div>;
}
