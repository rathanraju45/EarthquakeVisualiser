/**
 * @fileoverview Legend Component
 * Displays a color-coded legend explaining earthquake magnitude visualization.
 * Shows the color scale used for earthquake markers on the map.
 * @module components/Legend
 */

import React from 'react';

/**
 * Legend Component
 * 
 * Renders a visual legend showing the color scale for earthquake magnitudes.
 * Displays 6 magnitude thresholds with corresponding colors:
 * - M ≥ 6: Deep red (major earthquakes)
 * - M ≥ 5: Red (moderate earthquakes)
 * - M ≥ 4: Orange
 * - M ≥ 3: Yellow
 * - M ≥ 2: Light green
 * - M < 2: Green (minor earthquakes)
 * 
 * Also includes a note that marker size scales with magnitude.
 * 
 * @returns Legend panel with color scale
 * 
 * @example
 * ```tsx
 * <Legend />
 * ```
 */
export default function Legend() {
  return (
    <div>
      <h2 className="font-semibold mb-2">Legend</h2>
      <div className="text-xs text-gray-700">Color scale by magnitude</div>
      <div className="mt-2 space-y-1">
        {[6, 5, 4, 3, 2, 0].map((m) => (
          <div key={m} className="flex items-center gap-2 text-sm">
            <span 
              className="inline-block w-4 h-4 rounded-full" 
              style={{ background: colorFor(m) }} 
              aria-hidden="true"
            />
            <span>M ≥ {m}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-700">Marker size increases with magnitude</div>
    </div>
  );
}

/**
 * Maps a magnitude value to its corresponding color code.
 * Matches the color scale used in markerColorByMagnitude utility.
 * 
 * @param m - Magnitude threshold value
 * @returns Hexadecimal color code
 */
function colorFor(m: number) {
  if (m >= 6) return '#a10f2b';
  if (m >= 5) return '#d62d20';
  if (m >= 4) return '#f17c00';
  if (m >= 3) return '#f4b400';
  if (m >= 2) return '#7cb342';
  return '#43a047';
}
