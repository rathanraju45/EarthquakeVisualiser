import React from 'react';
import './App.css';
import { EarthquakeProvider, useEarthquakes } from './context/EarthquakeContext';
import MapView from './components/MapView';
import Summary from './components/Summary';
import Legend from './components/Legend';
import MobileDrawer from './components/MobileDrawer';
import FilterControls from './components/FilterControls';

function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { lastUpdated, loading, error, refresh } = useEarthquakes();
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">Earthquake Visualizer</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-500">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => refresh()} disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </header>
  );
}

function AppInner() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="safe-screen flex flex-col">
      <Header onOpenDrawer={() => setOpen(true)} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div>
          <MapView invalidateKey={open} />
          {!open && (
            <div className="lg:hidden fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[1000]">
              <button onClick={() => setOpen(true)} className="px-4 py-3 rounded-full shadow-lg bg-white border" aria-label="Open filters">
                Filters
              </button>
            </div>
          )}
        </div>
        <aside className="border-l p-3 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <FilterControls />
            <Summary />
            <Legend />
          </div>
        </aside>
      </main>
      <footer className="h-10 flex items-center justify-center text-xs text-gray-500 border-t">
        Data: USGS — for educational use
      </footer>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <EarthquakeProvider>
      <AppInner />
    </EarthquakeProvider>
  );
}
