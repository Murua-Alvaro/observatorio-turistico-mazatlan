import { lazy, Suspense, useMemo, useState } from 'react';
import { Anchor, BedDouble, Building2, CarFront, ChevronDown, Database, Download, FileDown, Globe2, LayoutDashboard, Lightbulb, Menu, Plane, RefreshCw, Search, X } from 'lucide-react';
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
type NavItem = { id: Tab; label: string; group: 'Análisis' | 'Sectores' | 'Datos'; icon: typeof LayoutDashboard };

const nav: NavItem[] = [
  { id: 'panorama', label: 'Panorama', group: 'Análisis', icon: LayoutDashboard },
  { id: 'insights', label: 'Hallazgos y alertas', group: 'Análisis', icon: Lightbulb },
  { id: 'business', label: 'Comercio y servicios', group: 'Sectores', icon: Building2 },
  { id: 'hotel', label: 'Hotelería', group: 'Sectores', icon: BedDouble },
  { id: 'airport', label: 'Aeropuerto', group: 'Datos', icon: Plane },
  { id: 'cruises', label: 'Cruceros', group: 'Datos', icon: Anchor },
  { id: 'markets', label: 'Mercados de origen', group: 'Datos', icon: Globe2 },
  { id: 'mobility', label: 'Movilidad terrestre', group: 'Datos', icon: CarFront },
  { id: 'methodology', label: 'Fuentes y metodología', group: 'Datos', icon: Database },
];

const indicatorToTab: Record<string, Tab> = {
  overview: 'panorama',
  airport: 'airport',
  hotel: 'hotel',
  cruises: 'cruises',
  markets: 'markets',
  mobility: 'mobility',
};

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

  const resetFilters = () => {
    setYear(2026);
    setViewMode('monthly');
    setCompare(true);
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

  const activeIndicator = ['airport','hotel','cruises','markets','mobility'].includes(tab) ? tab : 'overview';
  const activeAudience = tab === 'business' ? 'business' : tab === 'hotel' ? 'hotel' : 'overview';

  return <div className="app-shell app-shell--explorer">
    <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegación"><Menu size={20}/></button>

    <aside className={`sidebar sidebar--explorer ${menuOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__head">
        <button className="brand" onClick={() => open('panorama')}>
          <span className="brand__mark">MZT</span>
          <span className="brand__text"><strong>Observatorio Turístico</strong><small>Mazatlán · Sinaloa</small></span>
        </button>
        <button className="sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"><X size={18}/></button>
      </div>

      <div className="sidebar__search"><Search size={14}/><span>Explorar información</span></div>

      <nav className="side-nav side-nav--disclosure" aria-label="Secciones del observatorio">
        {(['Análisis','Sectores','Datos'] as const).map((group) => <details className="nav-disclosure" key={group} open>
          <summary><span>{group}</span><ChevronDown size={14}/></summary>
          <div className="nav-disclosure__items">
            {nav.filter((item) => item.group === group).map((item) => {
              const Icon = item.icon;
              return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => open(item.id)}><Icon size={16}/><span>{item.label}</span></button>;
            })}
          </div>
        </details>)}
      </nav>

      <div className="sidebar__foot sidebar__foot--explorer">
        <div className="data-status"><span className="status-dot"/><div><strong>Datos auditados</strong><small>Corte {data.meta.cutoff}</small></div></div>
        <button onClick={() => open('methodology')}>Ver cobertura y fuentes</button>
      </div>
    </aside>

    {menuOpen ? <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación"/> : null}

    <div className="workspace workspace--explorer">
      <header className="institution-bar">
        <div><span>OBSERVATORIO TURÍSTICO DE MAZATLÁN</span><strong>{nav.find((item) => item.id === tab)?.label}</strong></div>
        <div className="institution-bar__actions">
          <button onClick={() => downloadObservatoryCsv(year)}><Download size={14}/> Descargar datos</button>
          <button onClick={printExecutiveReport}><FileDown size={14}/> Imprimir / PDF</button>
        </div>
      </header>

      <section className="filter-bar" aria-label="Controles del explorador">
        <label><span>Audiencia</span><select value={activeAudience} onChange={(e) => open(e.target.value === 'business' ? 'business' : e.target.value === 'hotel' ? 'hotel' : 'panorama')}><option value="overview">General</option><option value="business">Comercio y servicios</option><option value="hotel">Hotelería</option></select></label>
        <label><span>Año</span><select value={year} onChange={(e) => setYear(Number(e.target.value) as ObservatoryYear)}><option value={2026}>2026</option><option value={2025}>2025</option></select></label>
        <label><span>Frecuencia</span><select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}><option value="monthly">Mensual</option><option value="cumulative">Acumulada</option></select></label>
        <label><span>Indicador</span><select value={activeIndicator} onChange={(e) => open(indicatorToTab[e.target.value] ?? 'panorama')}><option value="overview">Todos</option><option value="airport">Pasajeros aéreos</option><option value="hotel">Hotelería</option><option value="cruises">Cruceros</option><option value="markets">Mercados de origen</option><option value="mobility">Movilidad carretera</option></select></label>
        <label><span>Comparación</span><select value={compare ? 'yoy' : 'none'} onChange={(e) => setCompare(e.target.value === 'yoy')}><option value="yoy">Mismo periodo anterior</option><option value="none">Sin comparación</option></select></label>
        <button className="filter-reset" onClick={resetFilters}><RefreshCw size={14}/> Restablecer</button>
      </section>

      <div className="workspace-context">
        <span>Periodo activo: <strong>{year}</strong></span>
        <span>Vista: <strong>{viewMode === 'monthly' ? 'Mensual' : 'Acumulada'}</strong></span>
        <span>Comparación: <strong>{compare ? 'Interanual' : 'Desactivada'}</strong></span>
        <span>Actualización: <strong>{data.meta.cutoff}</strong></span>
      </div>

      <main className="workspace-main workspace-main--explorer">
        <Suspense fallback={<div className="loading-state"><span/>Cargando módulo analítico…</div>}>
          {pages[tab]}
        </Suspense>
      </main>

      <footer className="pro-footer"><div><strong>Observatorio Turístico de Mazatlán</strong><span>Datos oficiales organizados para análisis sectorial.</span></div><button onClick={() => open('methodology')}>Metodología y trazabilidad</button></footer>
    </div>
  </div>;
}
