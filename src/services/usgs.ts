import axios from 'axios';
import type { Earthquake, EarthquakeFeed } from '../types/earthquake';

const USGS_ALL_DAY = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Simple in-memory cache with TTL
const cache = new Map<string, { ts: number; ttl: number; data: EarthquakeFeed }>();

export async function fetchEarthquakes(ttlMs = 5 * 60 * 1000): Promise<EarthquakeFeed> {
  const key = USGS_ALL_DAY;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.ts < cached.ttl) {
    return cached.data;
  }

  const resp = await axios.get(USGS_ALL_DAY, { timeout: 15000 });
  const data = resp.data;
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Invalid USGS GeoJSON');
  }

  const quakes: Earthquake[] = data.features.map((f: any) => {
    const [longitude, latitude, depth] = f.geometry?.coordinates || [];
    const {
      mag: magnitude = 0,
      place = 'Unknown',
      time = 0,
      url = '',
    } = f.properties || {};

    return {
      id: f.id ?? `${latitude},${longitude},${time}`,
      latitude: Number(latitude),
      longitude: Number(longitude),
      depth: Number(depth),
      magnitude: Number(magnitude),
      place: String(place),
      time: Number(time),
      url: String(url),
      raw: f,
    } as Earthquake;
  }).filter((q: Earthquake) => Number.isFinite(q.latitude) && Number.isFinite(q.longitude));

  const feed: EarthquakeFeed = {
    metadata: {
      generated: data.metadata?.generated ?? Date.now(),
      url: USGS_ALL_DAY,
      title: data.metadata?.title ?? 'USGS All Day',
      count: quakes.length,
    },
    quakes,
  };

  cache.set(key, { ts: now, ttl: ttlMs, data: feed });
  return feed;
}

export function invalidateCache() {
  cache.clear();
}
