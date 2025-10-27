/**
 * @fileoverview Main Application Component
 * Root component that orchestrates the earthquake visualization application.
 * Provides responsive layout with header, map view, sidebar, and mobile drawer.
 * @module App
 */

import React from 'react';
import './App.css';
import { EarthquakeProvider, useEarthquakes } from './context/EarthquakeContext';
import MapView from './components/MapView';
import Summary from './components/Summary';
import Legend from './components/Legend';
import MobileDrawer from './components/MobileDrawer';
import FilterControls from './components/FilterControls';
import ErrorBanner from './components/ErrorBanner';

/**
 * Header Component
 * 
 * Displays the application title, last update timestamp, and refresh button.
 * Shows error messages when data fetching fails.
 * 
 * @param props - Component props
 * @param props.onOpenDrawer - Callback to open mobile drawer (currently unused)
 */
function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { lastUpdated, loading, refresh } = useEarthquakes();
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">Earthquake Visualizer</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => refresh()} 
          disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}

/**
 * App Inner Component
 * 
 * Main application layout with responsive design:
 * - Desktop: Map on left, fixed sidebar on right
 * - Mobile/Tablet: Full-screen map with floating filter button and bottom drawer
 * 
 * Layout features:
 * - Sticky header with title and controls
 * - Error banner for API failures with retry capability
 * - Full-height map view
 * - Responsive sidebar (hidden on mobile)
 * - Floating filter button (mobile only)
 * - Bottom drawer for filters (mobile only)
 * - Footer with data attribution
 * - Full-height map view
 * - Responsive sidebar (hidden on mobile)
 * - Floating filter button (mobile only)
 * - Bottom drawer for filters (mobile only)
 */
function AppInner() {
  const [open, setOpen] = React.useState(false);
  const { error, refresh, clearError, loading } = useEarthquakes();
  
  return (
    <div className="safe-screen flex flex-col">
      <Header onOpenDrawer={() => setOpen(true)} />
      
      {/* Error Banner */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorBanner 
            error={error} 
            onRetry={refresh}
            onDismiss={clearError}
            isRetrying={loading}
          />
        </div>
      )}
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Map Section */}
        <div>
          <MapView invalidateKey={open} />
          {/* Floating Filter Button (Mobile Only) */}
          {!open && (
            <div className="lg:hidden fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[1000]">
              <button 
                onClick={() => setOpen(true)} 
                className="px-4 py-3 rounded-full shadow-lg bg-white border" 
                aria-label="Open filters"
              >
                Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Sidebar (Desktop Only) */}
        <aside className="border-l p-3 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Show error in sidebar too for desktop users */}
            {error && (
              <ErrorBanner 
                error={error} 
                onRetry={refresh}
                onDismiss={clearError}
                isRetrying={loading}
              />
            )}
            <FilterControls />
            <Summary />
            <Legend />
          </div>
        </aside>
      </main>
      
      {/* Footer */}
      <footer className="h-10 flex items-center justify-center text-xs text-gray-500 border-t">
        Data: USGS — for educational use
      </footer>
      
      {/* Mobile Drawer */}
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/**
 * Root App Component
 * 
 * Wraps the application in the EarthquakeProvider context.
 * Provides global earthquake data and filter state to all child components.
 * 
 * @returns Application root
 * 
 * @example
 * ```tsx
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 */
export default function App() {
  return (
    <EarthquakeProvider>
      <AppInner />
    </EarthquakeProvider>
  );
}
