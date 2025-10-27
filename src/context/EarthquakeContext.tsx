/**
 * @fileoverview Earthquake Data Context
 * Provides global state management for earthquake data, filters, and loading states.
 * Uses React Context API to share data across the component tree.
 * Includes comprehensive error handling and retry capabilities.
 * @module context/EarthquakeContext
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { fetchEarthquakes, USGSError } from '../services/usgs';
import type { Earthquake, EarthquakeFeed } from '../types/earthquake';

/**
 * Time window options for filtering earthquakes by recency.
 */
export type TimeWindow = '1h' | '6h' | '12h' | '24h';

/**
 * Converts a time window string to milliseconds.
 * @param w - Time window identifier
 * @returns Duration in milliseconds
 */
function windowToMs(w: TimeWindow): number {
  switch (w) {
    case '1h': return 1 * 60 * 60 * 1000;
    case '6h': return 6 * 60 * 60 * 1000;
    case '12h': return 12 * 60 * 60 * 1000;
    case '24h':
    default: return 24 * 60 * 60 * 1000;
  }
}

/**
 * Filter configuration for earthquake data.
 */
export type Filters = {
  /** Minimum magnitude threshold */
  magMin: number;
  /** Maximum magnitude threshold */
  magMax: number;
  /** Time window for filtering recent earthquakes */
  window: TimeWindow;
  /** Whether to enable marker clustering */
  cluster: boolean;
  /** Color mode for markers (by magnitude or depth) */
  colorMode: 'magnitude' | 'depth';
};

/**
 * Error information structure.
 */
export type ErrorInfo = {
  /** User-friendly error message */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Whether the error can be retried */
  isRetryable: boolean;
};

/**
 * Global earthquake state and actions.
 */
type EarthquakeState = {
  /** Raw earthquake feed data from USGS */
  feed?: EarthquakeFeed;
  /** Filtered earthquakes based on current filters */
  filtered: Earthquake[];
  /** Timestamp of last successful data fetch */
  lastUpdated?: number;
  /** Loading state indicator */
  loading: boolean;
  /** Error information if fetch failed */
  error?: ErrorInfo;
  /** Current filter configuration */
  filters: Filters;
  /** Update filter settings (partial update supported) */
  setFilters: (f: Partial<Filters>) => void;
  /** Manually refresh earthquake data from USGS */
  refresh: () => Promise<void>;
  /** Clear the current error state */
  clearError: () => void;
};

/**
 * React Context for earthquake state.
 */
const Ctx = createContext<EarthquakeState | undefined>(undefined);

/**
 * Earthquake Context Provider Component.
 * Manages earthquake data fetching, filtering, and state distribution.
 * 
 * @param children - Child components that need access to earthquake data
 * 
 * @example
 * ```tsx
 * <EarthquakeProvider>
 *   <App />
 * </EarthquakeProvider>
 * ```
 */
export const EarthquakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feed, setFeed] = useState<EarthquakeFeed | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | undefined>();
  const [lastUpdated, setLastUpdated] = useState<number | undefined>();
  const [filters, setFiltersState] = useState<Filters>({ 
    magMin: 0, 
    magMax: 10, 
    window: '24h', 
    cluster: true, 
    colorMode: 'magnitude' 
  });

  /**
   * Updates filter settings with partial updates.
   */
  const setFilters = useCallback((f: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);

  /**
   * Clears the current error state.
   */
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  /**
   * Fetches fresh earthquake data from USGS API.
   * Updates loading, error, and feed state accordingly.
   * Implements retry logic for transient errors.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await fetchEarthquakes();
      setFeed(result);
      setLastUpdated(Date.now());
      // Clear any previous errors on success
      setError(undefined);
    } catch (e: unknown) {
      console.error('Failed to fetch earthquake data:', e);
      
      if (e instanceof USGSError) {
        setError({
          message: e.message,
          code: e.code,
          isRetryable: e.isRetryable,
        });
      } else if (e instanceof Error) {
        setError({
          message: e.message || 'An unexpected error occurred while fetching earthquake data.',
          code: 'UNKNOWN_ERROR',
          isRetryable: false,
        });
      } else {
        setError({
          message: 'An unexpected error occurred while fetching earthquake data.',
          code: 'UNKNOWN_ERROR',
          isRetryable: false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial mount
  useEffect(() => { 
    void refresh(); 
  }, [refresh]);

  /**
   * Memoized filtered earthquake list based on current filters.
   * Filters by magnitude range and time window.
   */
  const filtered = useMemo(() => {
    const list = feed?.quakes ?? [];
    const since = Date.now() - windowToMs(filters.window);
    return list.filter(q => 
      q.magnitude >= filters.magMin && 
      q.magnitude <= filters.magMax && 
      q.time >= since
    );
  }, [feed, filters]);

  const value = { 
    feed, 
    filtered, 
    lastUpdated, 
    loading, 
    error, 
    filters, 
    setFilters, 
    refresh, 
    clearError 
  };
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/**
 * Custom hook to access earthquake context.
 * Must be used within an EarthquakeProvider.
 * 
 * @returns Earthquake state and actions
 * @throws {Error} If used outside of EarthquakeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { filtered, loading, refresh } = useEarthquakes();
 *   // ... use earthquake data
 * }
 * ```
 */
export function useEarthquakes() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEarthquakes must be used within EarthquakeProvider');
  return ctx;
}
