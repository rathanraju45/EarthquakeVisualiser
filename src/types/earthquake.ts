/**
 * @fileoverview Type definitions and utility functions for earthquake data visualization.
 * Provides TypeScript types for earthquake data models and helper functions for
 * color-coding and sizing markers based on magnitude and depth.
 * @module types/earthquake
 */

/**
 * Represents a single earthquake event with essential geospatial and seismic properties.
 */
export type Earthquake = {
  /** Unique identifier for the earthquake event */
  id: string;
  /** Latitude coordinate in decimal degrees */
  latitude: number;
  /** Longitude coordinate in decimal degrees */
  longitude: number;
  /** Depth of the earthquake in kilometers below the surface */
  depth: number;
  /** Magnitude of the earthquake on the Richter scale */
  magnitude: number;
  /** Human-readable location description */
  place: string;
  /** Timestamp of the earthquake occurrence in epoch milliseconds */
  time: number;
  /** URL to the official USGS earthquake detail page */
  url: string;
  /** Optional raw data from the USGS GeoJSON feed */
  raw?: any;
};

/**
 * Represents a collection of earthquake events with metadata.
 */
export type EarthquakeFeed = {
  /** Metadata about the earthquake feed */
  metadata: {
    /** Timestamp when the feed was generated (epoch ms) */
    generated: number;
    /** URL of the USGS feed source */
    url: string;
    /** Title/description of the feed */
    title: string;
    /** Total number of earthquakes in the feed */
    count: number;
  };
  /** Array of earthquake events */
  quakes: Earthquake[];
};

/**
 * Formats an epoch timestamp into a human-readable localized string.
 * @param epochMs - Timestamp in epoch milliseconds
 * @returns Localized date and time string, or the original value if parsing fails
 * @example
 * formatTime(1609459200000) // "1/1/2021, 12:00:00 AM" (locale-dependent)
 */
export function formatTime(epochMs: number): string {
  try {
    return new Date(epochMs).toLocaleString();
  } catch {
    return '' + epochMs;
  }
}

/**
 * Determines the marker color based on earthquake magnitude.
 * Uses a color gradient from green (minor) to deep red (major earthquakes).
 * 
 * @param magnitude - Earthquake magnitude on the Richter scale
 * @returns Hexadecimal color code
 * 
 * Color Scale:
 * - >= 6.0: #a10f2b (deep red - major)
 * - >= 5.0: #d62d20 (red - moderate)
 * - >= 4.0: #f17c00 (orange)
 * - >= 3.0: #f4b400 (yellow)
 * - >= 2.0: #7cb342 (light green)
 * - < 2.0:  #43a047 (green - minor)
 * 
 * @example
 * markerColorByMagnitude(6.5) // "#a10f2b" (deep red)
 * markerColorByMagnitude(2.3) // "#7cb342" (light green)
 */
export function markerColorByMagnitude(magnitude: number): string {
  if (magnitude >= 6) return '#a10f2b'; // deep red
  if (magnitude >= 5) return '#d62d20';
  if (magnitude >= 4) return '#f17c00';
  if (magnitude >= 3) return '#f4b400';
  if (magnitude >= 2) return '#7cb342';
  return '#43a047';
}

/**
 * Calculates the visual radius for an earthquake marker based on magnitude.
 * Ensures a minimum size for visibility while scaling with magnitude intensity.
 * 
 * @param magnitude - Earthquake magnitude on the Richter scale
 * @returns Radius in pixels (minimum 4px)
 * 
 * @example
 * markerRadius(3.5) // 10.5 (3.5 * 3)
 * markerRadius(0.5) // 4 (minimum enforced)
 */
export function markerRadius(magnitude: number): number {
  return Math.max(4, magnitude * 3);
}

/**
 * Determines the marker color based on earthquake depth.
 * Uses a color gradient from green (shallow) to purple (deep earthquakes).
 * 
 * @param depthKm - Depth in kilometers below the surface
 * @returns Hexadecimal color code
 * 
 * Depth Scale:
 * - < 10 km:    #2ecc71 (shallow green)
 * - < 30 km:    #27ae60 (green)
 * - < 70 km:    #f1c40f (yellow)
 * - < 150 km:   #e67e22 (orange)
 * - < 300 km:   #d35400 (deep orange)
 * - >= 300 km:  #8e44ad (deep purple)
 * - invalid:    #8884d8 (default blue)
 * 
 * @example
 * markerColorByDepth(5) // "#2ecc71" (shallow)
 * markerColorByDepth(400) // "#8e44ad" (very deep)
 */
export function markerColorByDepth(depthKm: number): string {
  if (!Number.isFinite(depthKm)) return '#8884d8';
  if (depthKm < 10) return '#2ecc71'; // shallow green
  if (depthKm < 30) return '#27ae60';
  if (depthKm < 70) return '#f1c40f';
  if (depthKm < 150) return '#e67e22';
  if (depthKm < 300) return '#d35400';
  return '#8e44ad'; // deep purple
}
