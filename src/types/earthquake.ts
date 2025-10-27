export type Earthquake = {
  id: string;
  latitude: number;
  longitude: number;
  depth: number; // km
  magnitude: number;
  place: string;
  time: number; // epoch ms
  url: string;
  raw?: any;
};

export type EarthquakeFeed = {
  metadata: {
    generated: number;
    url: string;
    title: string;
    count: number;
  };
  quakes: Earthquake[];
};

export function formatTime(epochMs: number): string {
  try {
    return new Date(epochMs).toLocaleString();
  } catch {
    return '' + epochMs;
  }
}

export function markerColorByMagnitude(magnitude: number): string {
  // Simple color scale by magnitude
  if (magnitude >= 6) return '#a10f2b'; // deep red
  if (magnitude >= 5) return '#d62d20';
  if (magnitude >= 4) return '#f17c00';
  if (magnitude >= 3) return '#f4b400';
  if (magnitude >= 2) return '#7cb342';
  return '#43a047';
}

export function markerRadius(magnitude: number): number {
  // Scale radius with mag; ensure minimum size
  return Math.max(4, magnitude * 3);
}

export function markerColorByDepth(depthKm: number): string {
  // Shallow (0km) -> deep (700km) scale
  if (!Number.isFinite(depthKm)) return '#8884d8';
  if (depthKm < 10) return '#2ecc71'; // shallow green
  if (depthKm < 30) return '#27ae60';
  if (depthKm < 70) return '#f1c40f';
  if (depthKm < 150) return '#e67e22';
  if (depthKm < 300) return '#d35400';
  return '#8e44ad'; // deep purple
}
