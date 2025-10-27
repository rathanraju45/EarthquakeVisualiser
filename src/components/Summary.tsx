/**
 * @fileoverview Summary Statistics Component
 * Displays aggregated statistics for filtered earthquake data.
 * Shows total count, strongest earthquake, and average magnitude.
 * @module components/Summary
 */

import React, { useMemo } from 'react';
import { useEarthquakes } from '../context/EarthquakeContext';

/**
 * Summary Statistics Component
 * 
 * Computes and displays real-time statistics for the currently filtered earthquakes:
 * - Total earthquake count
 * - Strongest earthquake magnitude and location
 * - Average magnitude across all filtered earthquakes
 * 
 * Statistics are automatically recalculated when filters change.
 * Uses memoization for performance optimization.
 * 
 * @returns Summary statistics panel
 * 
 * @example
 * ```tsx
 * <Summary />
 * ```
 */
export default function Summary() {
  const { filtered } = useEarthquakes();
  
  /**
   * Memoized statistics calculation to avoid unnecessary recomputation.
   * Recalculates only when the filtered earthquake list changes.
   */
  const stats = useMemo(() => {
    const count = filtered.length;
    const max = filtered.reduce((m, q) => Math.max(m, q.magnitude), 0);
    const avg = count ? filtered.reduce((s, q) => s + q.magnitude, 0) / count : 0;
    const maxItem = filtered.reduce(
      (best, q) => q.magnitude > (best?.magnitude ?? -Infinity) ? q : best, 
      undefined as any
    );
    return { count, max, avg, maxPlace: maxItem?.place };
  }, [filtered]);

  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2">Summary</h2>
      <div className="text-sm space-y-1">
        <div>Total quakes: <span className="font-medium">{stats.count}</span></div>
        <div>
          Strongest: <span className="font-medium">{stats.max.toFixed(1)}</span> 
          {stats.maxPlace ? ` — ${stats.maxPlace}` : ''}
        </div>
        <div>Average magnitude: <span className="font-medium">{stats.avg.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
