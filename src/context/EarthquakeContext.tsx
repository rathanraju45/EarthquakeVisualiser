import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchEarthquakes } from '../services/usgs';
import type { Earthquake, EarthquakeFeed } from '../types/earthquake';

export type TimeWindow = '1h' | '6h' | '12h' | '24h';

function windowToMs(w: TimeWindow): number {
  switch (w) {
    case '1h': return 1 * 60 * 60 * 1000;
    case '6h': return 6 * 60 * 60 * 1000;
    case '12h': return 12 * 60 * 60 * 1000;
    case '24h':
    default: return 24 * 60 * 60 * 1000;
  }
}

export type Filters = {
  magMin: number;
  magMax: number;
  window: TimeWindow;
  cluster: boolean;
  colorMode: 'magnitude' | 'depth';
};

type EarthquakeState = {
  feed?: EarthquakeFeed;
  filtered: Earthquake[];
  lastUpdated?: number;
  loading: boolean;
  error?: string;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<EarthquakeState | undefined>(undefined);

export const EarthquakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feed, setFeed] = useState<EarthquakeFeed | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<number | undefined>();
  const [filters, setFiltersState] = useState<Filters>({ magMin: 0, magMax: 10, window: '24h', cluster: true, colorMode: 'magnitude' });

  const setFilters = (f: Partial<Filters>) => setFiltersState(prev => ({ ...prev, ...f }));

  const refresh = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await fetchEarthquakes();
      setFeed(result);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch earthquakes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const list = feed?.quakes ?? [];
    const since = Date.now() - windowToMs(filters.window);
    return list.filter(q => q.magnitude >= filters.magMin && q.magnitude <= filters.magMax && q.time >= since);
  }, [feed, filters]);

  const value = { feed, filtered, lastUpdated, loading, error, filters, setFilters, refresh };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useEarthquakes() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEarthquakes must be used within EarthquakeProvider');
  return ctx;
}
