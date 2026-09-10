import { lazy, Suspense, useMemo, useState } from 'react';
import { Anchor, BedDouble, Building2, CalendarDays, CarFront, Database, Download, FileDown, Globe2, LayoutDashboard, Lightbulb, MapPin, Menu, Plane, RefreshCw, X } from 'lucide-react';
import { data } from './data/model';
import { downloadObservatoryCsv, printExecutiveReport, type ObservatoryYear } from './lib/export';

const Panorama = lazy(() => import('./pages/Panorama').then((m) => ({ default: m.Panorama })));
const Business = lazy(() => import('./pages/Business').then((m) => ({ default: m.Business })));
const Hotel = lazy(() => import('./pages/Hotel').then((m) => ({ default: m.Hotel })));
const Airport = lazy(() => import('./pages/Airport').then((m) => ({ default: m.Airport })));
const Cruises = lazy(() => import('./pages/Cruises').then((m) => ({ default: m.Cruises })));
const Markets = lazy(() => import('./pages/Markets').then((m) => ({ default: m.Markets })));
const Mobility = lazy(() => import('./pages/Mobility').then((m) => ({ default: m.Mobility })));
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })));
const Methodology = lazy(() => import('./pages/Methodology').then((m) => ({ default: m.Methodology })));

export type ViewMode = 'monthly' | 'cumulative';
type Tab = 'panorama' | 'business' | 'hotel' | 'airport' | 'cruises' | 'markets' | 'mobility' | 'insights' | 'methodology';
type NavItem = { id: Tab; label: string; group: string; icon: typeof LayoutDashboard };

const nav: NavItem[] = [
  { id: 'panorama', label: 'Resumen ejecutivo', group: 'Observatorio', icon: LayoutDashboard },
  { id: 'insights', label: 'Centro de hallazgos', group: 'Observatorio', icon: Lightbulb },
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
  const [year, setYear] = useState<ObservatoryYear>(2026);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [compare, setCompare] = useState(true);

  const open = (next: Tab) => {
    setTab(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = useMemo<Record<Tab, React.ReactNode>>(() => ({
    panorama: <Panorama year={year} viewMode={viewMode} compare={compare} onOpenAirport={() => open('airport')} onOpenBusiness={() => open('business')} onOpenHotel={() => open('hotel')} onOpenInsights={() => open('insights')} />,
    business: <Business year={year} viewMode={viewMode} compare={compare} onNavigate={open} />,
    hotel: <Hotel year={year} compare={compare} onNavigate={open} />,
    airport: <Airport year={year} viewMode={viewMode} compare={compare} />,
    cruises: <Cruises year={year} viewMode={viewMode} compare={compare} />,
    markets: <Markets year={year} />,
    mobility: <Mobility />,
    insights: <Insights year={year} onNavigate={open} />,
    methodology: <Methodology />,
  }), [year, viewMode, compare]);

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
        <span className="sidebar__micro">OMA · DataTur · SEMAR · SICT · INEGI. Las métricas conservan frecuencia y alcance de su fuente.</span>
      </div>
    </aside>

    {menuOpen ? <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"/> : null}

    <div className="workspace">
      <header className="workspace-bar workspace-bar--controls">
        <div className="workspace-bar__title"><span>INTELIGENCIA TURÍSTICA</span><strong>{nav.find((item) => item.id === tab)?.label}</strong></div>
        <div className="workspace-controls">
          <div className="toolbar-cluster" aria-label="Año"><span>Año</span><div className="toolbar-segment"><button className={year === 2025 ? 'active' : ''} onClick={() => setYear(2025)}>2025</button><button className={year === 2026 ? 'active' : ''} onClick={() => setYear(2026)}>2026</button></div></div>
          <div className="toolbar-cluster toolbar-cluster--view" aria-label="Vista"><span>Vista</span><div className="toolbar-segment"><button className={viewMode === 'monthly' ? 'active' : ''} onClick={() => setViewMode('monthly')}>Mensual</button><button className={viewMode === 'cumulative' ? 'active' : ''} onClick={() => setViewMode('cumulative')}>Acumulada</button></div></div>
          <button className={`toolbar-button ${compare ? 'active' : ''}`} onClick={() => setCompare((v) => !v)} title="Activar o desactivar comparación interanual"><RefreshCw size={14}/> Comparar</button>
          <button className="toolbar-button" onClick={() => downloadObservatoryCsv(year)}><Download size={14}/> CSV</button>
          <button className="toolbar-button toolbar-button--primary" onClick={printExecutiveReport}><FileDown size={14}/> Reporte</button>
        </div>
        <div className="workspace-bar__meta"><CalendarDays size={15}/><span>Corte</span><strong>{data.meta.cutoff}</strong></div>
      </header>

      <main className="workspace-main">
        <Suspense fallback={<div className="loading-state"><span/>Cargando módulo analítico…</div>}>
          {pages[tab]}
        </Suspense>
      </main>

      <footer className="pro-footer"><div><strong>Observatorio Turístico de Mazatlán</strong><span>Herramienta analítica para cámaras empresariales, hotelería y planeación sectorial.</span></div><button onClick={() => open('methodology')}>Trazabilidad y fuentes</button></footer>
    </div>
  </div>;
}
