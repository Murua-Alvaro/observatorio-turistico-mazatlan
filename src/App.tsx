import { lazy, Suspense, useMemo, useState } from 'react';
import { ChevronDown, Download, FileDown } from 'lucide-react';
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

export default function App() {
  const [tab, setTab] = useState<Tab>('panorama');
  const [year, setYear] = useState<ObservatoryYear>(2026);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [compare, setCompare] = useState(true);

  const open = (next: Tab) => {
    setTab(next);
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

  return <div className="ti-shell">
    <header className="ti-header">
      <button className="ti-brand" onClick={() => open('panorama')}>
        <span className="ti-brand__monogram">MZT</span>
        <span><strong>Observatorio Turístico</strong><small>Mazatlán · Inteligencia de destino</small></span>
      </button>

      <nav className="ti-nav" aria-label="Navegación principal">
        <button className={tab === 'panorama' ? 'active' : ''} onClick={() => open('panorama')}>Panorama</button>
        <button className={tab === 'business' ? 'active' : ''} onClick={() => open('business')}>Empresas</button>
        <button className={tab === 'hotel' ? 'active' : ''} onClick={() => open('hotel')}>Hotelería</button>
        <details className="ti-menu">
          <summary className={['airport','cruises','markets','mobility'].includes(tab) ? 'active' : ''}>Explorar datos <ChevronDown size={13}/></summary>
          <div className="ti-menu__panel">
            <button onClick={() => open('airport')}><strong>Aeropuerto</strong><small>OMA · total, nacional e internacional</small></button>
            <button onClick={() => open('cruises')}><strong>Cruceros</strong><small>DataTur / SEMAR · pasajeros y arribos</small></button>
            <button onClick={() => open('markets')}><strong>Mercados</strong><small>UPM / DataTur · país, región y sexo</small></button>
            <button onClick={() => open('mobility')}><strong>Movilidad</strong><small>SICT · aforos y composición vehicular</small></button>
          </div>
        </details>
        <button className={tab === 'insights' ? 'active' : ''} onClick={() => open('insights')}>Brief</button>
        <button className={tab === 'methodology' ? 'active' : ''} onClick={() => open('methodology')}>Fuentes</button>
      </nav>

      <div className="ti-header__actions">
        <button title="Descargar CSV" onClick={() => downloadObservatoryCsv(year)}><Download size={15}/><span>Datos</span></button>
        <button title="Imprimir o guardar PDF" onClick={printExecutiveReport}><FileDown size={15}/><span>PDF</span></button>
      </div>
    </header>

    <div className="ti-contextbar">
      <div className="ti-contextbar__status"><span className="live-dot"/><strong>Base auditada</strong><span>Corte {data.meta.cutoff}</span></div>
      <div className="ti-contextbar__controls">
        <div className="control-cluster"><span>Año</span><button className={year === 2025 ? 'active' : ''} onClick={() => setYear(2025)}>2025</button><button className={year === 2026 ? 'active' : ''} onClick={() => setYear(2026)}>2026</button></div>
        <div className="control-cluster"><span>Lectura</span><button className={viewMode === 'monthly' ? 'active' : ''} onClick={() => setViewMode('monthly')}>Mensual</button><button className={viewMode === 'cumulative' ? 'active' : ''} onClick={() => setViewMode('cumulative')}>Acumulada</button></div>
        <label className="compare-switch"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)}/><span/>Comparar año previo</label>
      </div>
    </div>

    <main className="ti-main">
      <Suspense fallback={<div className="ti-loading">Cargando módulo de inteligencia…</div>}>{pages[tab]}</Suspense>
    </main>

    <footer className="ti-footer">
      <div><strong>Observatorio Turístico de Mazatlán</strong><span>OMA · DataTur · SEMAR · UPM · SICT · INEGI EVI</span></div>
      <button onClick={() => open('methodology')}>Metodología, cobertura y limitaciones</button>
    </footer>
  </div>;
}
