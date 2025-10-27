import React from 'react';

export default function Legend() {
  return (
    <div>
      <h2 className="font-semibold mb-2">Legend</h2>
      <div className="text-xs text-gray-700">Color scale by magnitude</div>
      <div className="mt-2 space-y-1">
        {[6,5,4,3,2,0].map((m) => (
          <div key={m} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-4 h-4 rounded-full" style={{ background: colorFor(m) }} />
            <span>M ≥ {m}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-700">Marker size increases with magnitude</div>
    </div>
  );
}

function colorFor(m: number) {
  if (m >= 6) return '#a10f2b';
  if (m >= 5) return '#d62d20';
  if (m >= 4) return '#f17c00';
  if (m >= 3) return '#f4b400';
  if (m >= 2) return '#7cb342';
  return '#43a047';
}
