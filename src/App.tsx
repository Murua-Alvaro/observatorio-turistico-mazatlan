import { lazy, Suspense, useMemo, useState } from 'react';
import { ChevronDown, Download, FileDown, RotateCcw } from 'lucide-react';
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

const labels: Record<Tab, string> = {
  panorama: 'Panorama', business: 'Comercio y servicios', hotel: 'Hotelería', airport: 'Aeropuerto',
  cruises: 'Cruceros', markets: 'Mercados de origen', mobility: 'Movilidad terrestre',
  insights: 'Hallazgos y alertas', methodology: 'Fuentes y metodología',
};

const indicatorToTab: Record<string, Tab> = {
  overview: 'panorama', airport: 'airport', hotel: 'hotel', cruises: 'cruises', markets: 'markets', mobility: 'mobility',
};

export default function App() {
  const [tab, setTab] = useState<Tab>('panorama');
  const [year, setYear] = useState<ObservatoryYear>(2026);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [compare, setCompare] = useState(true);

  const open = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setYear(2026);
    setViewMode('monthly');
    setCompare(true);
    setTab('panorama');
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

  const activeIndicator = ['airport', 'hotel', 'cruises', 'markets', 'mobility'].includes(tab) ? tab : 'overview';
  const activeAudience = tab === 'business' ? 'business' : tab === 'hotel' ? 'hotel' : 'overview';

  return <div className="portal-shell">
    <header className="masthead">
      <button className="masthead__brand" onClick={() => open('panorama')}>
        <span className="masthead__sigla">MZT</span>
        <span><strong>Observatorio Turístico de Mazatlán</strong><small>Inteligencia para decisión empresarial y hotelera</small></span>
      </button>

      <nav className="primary-nav" aria-label="Navegación principal">
        <button className={tab === 'panorama' ? 'active' : ''} onClick={() => open('panorama')}>Panorama</button>
        <details className="nav-menu">
          <summary className={tab === 'business' || tab === 'hotel' ? 'active' : ''}>Sectores <ChevronDown size={13}/></summary>
          <div className="nav-menu__panel">
            <button onClick={() => open('business')}><strong>Comercio y servicios</strong><small>Demanda, mercados y estacionalidad</small></button>
            <button onClick={() => open('hotel')}><strong>Hotelería</strong><small>Ocupación, capacidad y demanda</small></button>
          </div>
        </details>
        <details className="nav-menu">
          <summary className={['airport','cruises','markets','mobility'].includes(tab) ? 'active' : ''}>Indicadores <ChevronDown size={13}/></summary>
          <div className="nav-menu__panel nav-menu__panel--wide">
            <button onClick={() => open('airport')}><strong>Aeropuerto</strong><small>Pasajeros terminales OMA</small></button>
            <button onClick={() => open('cruises')}><strong>Cruceros</strong><small>Pasajeros y arribos</small></button>
            <button onClick={() => open('markets')}><strong>Mercados de origen</strong><small>Nacionalidad de entradas</small></button>
            <button onClick={() => open('mobility')}><strong>Movilidad terrestre</strong><small>Aforos SICT</small></button>
          </div>
        </details>
        <button className={tab === 'insights' ? 'active' : ''} onClick={() => open('insights')}>Hallazgos</button>
        <button className={tab === 'methodology' ? 'active' : ''} onClick={() => open('methodology')}>Metodología</button>
      </nav>

      <div className="masthead__actions">
        <button onClick={() => downloadObservatoryCsv(year)}><Download size={14}/> CSV</button>
        <button onClick={printExecutiveReport}><FileDown size={14}/> PDF</button>
      </div>
    </header>

    <section className="selection-bar" aria-label="Selección de datos">
      <div className="selection-bar__title"><strong>Selección de datos</strong><span>Modifique dimensiones; la vista se actualiza de inmediato.</span></div>
      <label><span>Audiencia</span><select value={activeAudience} onChange={(e) => open(e.target.value === 'business' ? 'business' : e.target.value === 'hotel' ? 'hotel' : 'panorama')}><option value="overview">General</option><option value="business">Comercio y servicios</option><option value="hotel">Hotelería</option></select></label>
      <label><span>Año</span><select value={year} onChange={(e) => setYear(Number(e.target.value) as ObservatoryYear)}><option value={2026}>2026</option><option value={2025}>2025</option></select></label>
      <label><span>Frecuencia</span><select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}><option value="monthly">Mensual</option><option value="cumulative">Acumulada</option></select></label>
      <label><span>Conjunto</span><select value={activeIndicator} onChange={(e) => open(indicatorToTab[e.target.value] ?? 'panorama')}><option value="overview">Panorama</option><option value="airport">Aeropuerto</option><option value="hotel">Hotelería</option><option value="cruises">Cruceros</option><option value="markets">Mercados</option><option value="mobility">Movilidad</option></select></label>
      <label><span>Comparación</span><select value={compare ? 'yoy' : 'none'} onChange={(e) => setCompare(e.target.value === 'yoy')}><option value="yoy">Mismo periodo anterior</option><option value="none">Sin comparación</option></select></label>
      <button className="selection-reset" onClick={resetFilters}><RotateCcw size={13}/> Restablecer</button>
    </section>

    <div className="dataset-context">
      <span className="dataset-context__crumb">Inicio / {labels[tab]}</span>
      <div><span>Año <strong>{year}</strong></span><span>Vista <strong>{viewMode === 'monthly' ? 'Mensual' : 'Acumulada'}</strong></span><span>Corte <strong>{data.meta.cutoff}</strong></span></div>
    </div>

    <main className="dataset-main">
      <Suspense fallback={<div className="loading-state">Cargando datos…</div>}>
        {pages[tab]}
      </Suspense>
    </main>

    <footer className="portal-footer"><span>Observatorio Turístico de Mazatlán</span><span>Fuentes: OMA · DataTur · SEMAR · UPM · SICT · INEGI</span><button onClick={() => open('methodology')}>Cobertura y metodología</button></footer>
  </div>;
}
