import { lazy, Suspense, useState } from 'react';
import { Anchor, BedDouble, Building2, CalendarDays, CarFront, Database, Globe2, LayoutDashboard, MapPin, Menu, Plane, X } from 'lucide-react';
import { data } from './data/model';

const Panorama = lazy(() => import('./pages/Panorama').then((m) => ({ default: m.Panorama })));
const Business = lazy(() => import('./pages/Business').then((m) => ({ default: m.Business })));
const Hotel = lazy(() => import('./pages/Hotel').then((m) => ({ default: m.Hotel })));
const Airport = lazy(() => import('./pages/Airport').then((m) => ({ default: m.Airport })));
const Cruises = lazy(() => import('./pages/Cruises').then((m) => ({ default: m.Cruises })));
const Markets = lazy(() => import('./pages/Markets').then((m) => ({ default: m.Markets })));
const Mobility = lazy(() => import('./pages/Mobility').then((m) => ({ default: m.Mobility })));
const Methodology = lazy(() => import('./pages/Methodology').then((m) => ({ default: m.Methodology })));

type Tab = 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'methodology';

type NavItem = { id: Tab; label: string; group: string; icon: typeof LayoutDashboard };
const nav: NavItem[] = [
  { id: 'panorama', label: 'Resumen ejecutivo', group: 'Observatorio', icon: LayoutDashboard },
  { id: 'business', label: 'Empresas y comercio', group: 'Audiencias', icon: Building2 },
  { id: 'hotel', label: 'Sector hotelero', group: 'Audiencias', icon: BedDouble },
  { id: 'airport', label: 'Conectividad aérea', group: 'Indicadores', icon: Plane },
  { id: 'cruises', label: 'Cruceros', group: 'Indicadores', icon: Anchor },
  { id: 'markets', label: 'Mercados de origen', group: 'Indicadores', icon: Globe2 },
  { id: 'mobility', label: 'Movilidad terrestre', group: 'Indicadores', icon: CarFront },
  { id: 'methodology', label: 'Fuentes y metodología', group: 'Gobernanza', icon: Database },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('panorama');
  const [menuOpen, setMenuOpen] = useState(false);

  const open = (next: Tab) => {
    setTab(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages: Record<Tab, React.ReactNode> = {
    panorama: <Panorama onOpenAirport={() => open('airport')} onOpenBusiness={() => open('business')} onOpenHotel={() => open('hotel')} />,
    business: <Business />,
    hotel: <Hotel />,
    airport: <Airport />,
    cruises: <Cruises />,
    markets: <Markets />,
    mobility: <Mobility />,
    methodology: <Methodology />,
  };

  return <div className="app-shell app-shell--pro">
    <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegación"><Menu size={20}/></button>
    <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__head">
        <button className="brand brand--vertical" onClick={() => open('panorama')}>
          <span className="brand__mark">MZT</span>
          <span className="brand__text"><strong>Observatorio Turístico</strong><small>Mazatlán · Sinaloa</small></span>
        </button>
        <button className="sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"><X size={18}/></button>
      </div>

      <div className="sidebar__location"><MapPin size={14}/><span>Mazatlán, Sinaloa</span></div>

      <nav className="side-nav" aria-label="Secciones del observatorio">
        {['Observatorio','Audiencias','Indicadores','Gobernanza'].map((group) => <div className="side-nav__group" key={group}>
          <span className="side-nav__label">{group}</span>
          {nav.filter((item) => item.group === group).map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => open(item.id)}><Icon size={17}/><span>{item.label}</span></button>;
          })}
        </div>)}
      </nav>

      <div className="sidebar__foot">
        <div className="data-status"><span className="status-dot"/><div><strong>Datos auditados</strong><small>Corte {data.meta.cutoff}</small></div></div>
        <span className="sidebar__micro">Fuentes oficiales · OMA · DataTur · SEMAR · SICT · INEGI</span>
      </div>
    </aside>

    {menuOpen ? <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"/> : null}

    <div className="workspace">
      <header className="workspace-bar">
        <div className="workspace-bar__title"><span>INTELIGENCIA TURÍSTICA</span><strong>{nav.find((item) => item.id === tab)?.label}</strong></div>
        <div className="workspace-bar__meta"><CalendarDays size={15}/><span>Periodo principal</span><strong>2025—2026</strong></div>
      </header>

      <main className="workspace-main">
        <Suspense fallback={<div className="loading-state"><span/>Cargando módulo analítico…</div>}>
          {pages[tab]}
        </Suspense>
      </main>

      <footer className="pro-footer"><div><strong>Observatorio Turístico de Mazatlán</strong><span>Infraestructura analítica independiente para decisión empresarial y sectorial.</span></div><button onClick={() => open('methodology')}>Trazabilidad y fuentes</button></footer>
    </div>
  </div>;
}
