/**
 * @fileoverview Filter Controls Component
 * Provides interactive controls for filtering and configuring earthquake visualization.
 * Includes magnitude filter, time window selector, clustering toggle, and color mode.
 * @module components/FilterControls
 */

import React from 'react';
import { useEarthquakes } from '../context/EarthquakeContext';

/**
 * Filter Controls Component
 * 
 * Renders a set of interactive controls for customizing earthquake data display:
 * - Minimum magnitude slider
 * - Time window selector (1h, 6h, 12h, 24h)
 * - Clustering toggle
 * - Color mode selector (magnitude or depth)
 * - Refresh button
 * 
 * All controls are fully accessible with ARIA labels.
 * 
 * @returns Filter controls interface
 * 
 * @example
 * ```tsx
 * <FilterControls />
 * ```
 */
export default function FilterControls() {
  const { filters, setFilters, loading, refresh } = useEarthquakes();
  return (
    <div className="flex flex-col gap-3">
      {/* Minimum Magnitude Filter */}
      <label className="text-sm">Min Magnitude
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={filters.magMin}
          onChange={e => setFilters({ magMin: Number(e.target.value) })}
          className="ml-2 w-24 border rounded px-2 py-1"
          aria-label="Minimum magnitude"
        />
      </label>

      {/* Time Window Selector */}
      <label className="text-sm">Time Window
        <select
          className="ml-2 border rounded px-2 py-1 text-sm"
          value={filters.window}
          onChange={e => setFilters({ window: e.target.value as any })}
          aria-label="Time window"
        >
          <option value="1h">Last 1h</option>
          <option value="6h">Last 6h</option>
          <option value="12h">Last 12h</option>
          <option value="24h">Last 24h</option>
        </select>
      </label>

      {/* Clustering Toggle */}
      <label className="text-sm">Clustering
        <input type="checkbox" className="ml-2"
          checked={filters.cluster}
          onChange={e => setFilters({ cluster: e.target.checked })}
          aria-label="Toggle clustering"
        />
      </label>

      {/* Color Mode Selector */}
      <label className="text-sm">Color Mode
        <select
          className="ml-2 border rounded px-2 py-1 text-sm"
          value={filters.colorMode}
          onChange={e => setFilters({ colorMode: e.target.value as any })}
          aria-label="Color mode"
        >
          <option value="magnitude">Magnitude</option>
          <option value="depth">Depth</option>
        </select>
      </label>

      {/* Refresh Button */}
      <div>
        <button onClick={() => refresh()} disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
          aria-label="Refresh data">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
