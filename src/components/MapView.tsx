/**
 * @fileoverview Map View Component
 * Interactive Leaflet map displaying earthquake data with clustering support.
 * Renders earthquake markers with color-coding and size scaling based on magnitude/depth.
 * @module components/MapView
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEarthquakes } from '../context/EarthquakeContext';
import { formatTime, markerColorByMagnitude, markerColorByDepth, markerRadius } from '../types/earthquake';
import useSupercluster from 'use-supercluster';

/** Default map center (global view) */
const center: [number, number] = [20, 0];

/**
 * GeoJSON point feature for earthquake clustering.
 */
type PointFeature = {
  type: 'Feature';
  properties: { 
    cluster: boolean; 
    quakeId?: string; 
    magnitude?: number 
  };
  geometry: { 
    type: 'Point'; 
    coordinates: [number, number] 
  };
};

/**
 * Cluster Layer Component
 * 
 * Renders earthquake markers with clustering support using supercluster.
 * Individual earthquakes cluster together at lower zoom levels for performance.
 * Clicking a cluster zooms in to reveal individual earthquakes.
 * 
 * @param props - Component props
 * @param props.points - Array of GeoJSON point features
 * @param props.zoom - Current map zoom level
 * @param props.bounds - Current map viewport bounds [west, south, east, north]
 */
const ClusterLayer: React.FC<{ 
  points: PointFeature[]; 
  zoom: number; 
  bounds: [number, number, number, number] | undefined 
}> = ({ points, zoom, bounds }) => {
  const { filters } = useEarthquakes();
  const map = useMap();
  
  // Generate clusters based on current zoom and bounds
  const { clusters } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 60, maxZoom: 16 },
  });

  return <>
    {clusters.map((cluster: any) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const isCluster = cluster.properties.cluster;
      
      if (isCluster) {
        // Render cluster marker
        const count = cluster.properties.point_count as number;
        const r = Math.max(12, Math.min(40, 10 + count));
        return (
          <CircleMarker 
            key={`c-${cluster.id}`} 
            center={[lat, lng]} 
            radius={r}
            pathOptions={{ color: '#2563eb', fillOpacity: 0.5 }}
            eventHandlers={{ 
              click: () => map.setView([lat, lng], Math.min(map.getZoom() + 2, 16)) 
            }}
          >
            <Popup><div className="text-sm">{count} earthquakes</div></Popup>
          </CircleMarker>
        );
      }
      
      // Render individual earthquake marker within cluster
      const mag = cluster.properties.magnitude as number | undefined;
      const color = filters.colorMode === 'depth'
        ? markerColorByDepth(0) // depth not included in cluster props; fallback
        : markerColorByMagnitude(mag ?? 0);
      return (
        <CircleMarker 
          key={`p-${cluster.properties.quakeId}`} 
          center={[lat, lng]} 
          radius={markerRadius(mag ?? 0)}
          pathOptions={{ color, fillOpacity: 0.6 }} 
        />
      );
    })}
  </>;
};

/**
 * Map View Component
 * 
 * Main interactive map component using React-Leaflet.
 * Features:
 * - OpenStreetMap tile layer
 * - Earthquake markers with interactive popups
 * - Marker clustering for performance
 * - Color-coding by magnitude or depth
 * - Size scaling by magnitude
 * - Custom zoom controls (bottom-left)
 * - Responsive to filter changes
 * 
 * @param props - Component props
 * @param props.invalidateKey - Optional key to force map size recalculation
 * 
 * @example
 * ```tsx
 * <MapView />
 * ```
 */
export const MapView: React.FC<{ invalidateKey?: any }> = ({ invalidateKey }) => {
  const { filtered, filters } = useEarthquakes();

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <MapContainer 
        center={center} 
        zoom={2} 
        scrollWheelZoom 
        zoomControl={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomleft" />
        <InvalidateOnChange key={`inv-${String(invalidateKey)}`} />
        {(() => {
          // Transform earthquake data to GeoJSON point features
          const points: PointFeature[] = filtered.map(q => ({
            type: 'Feature',
            properties: { cluster: false, quakeId: q.id, magnitude: q.magnitude },
            geometry: { type: 'Point', coordinates: [q.longitude, q.latitude] },
          }));
          return (
            <MapClusterOrPoints 
              points={points} 
              filtersMode={filters.colorMode} 
              fullData={filtered} 
              enableCluster={filters.cluster} 
            />
          );
        })()}
      </MapContainer>
    </div>
  );
};

/**
 * Map Cluster or Points Component
 * 
 * Conditionally renders either clustered markers or individual earthquake markers
 * based on the clustering filter setting. Extracts current map bounds and zoom
 * level for cluster calculation.
 * 
 * @param props - Component props
 * @param props.points - GeoJSON point features for clustering
 * @param props.filtersMode - Color mode (magnitude or depth)
 * @param props.fullData - Full earthquake data for individual rendering
 * @param props.enableCluster - Whether clustering is enabled
 */
const MapClusterOrPoints: React.FC<{ 
  points: PointFeature[]; 
  filtersMode: 'magnitude' | 'depth'; 
  fullData: any[]; 
  enableCluster: boolean 
}> = ({ points, filtersMode, fullData, enableCluster }) => {
  const map = useMap();
  const boundsLeaflet = map.getBounds();
  const bounds: [number, number, number, number] = [
    boundsLeaflet.getWest(),
    boundsLeaflet.getSouth(),
    boundsLeaflet.getEast(),
    boundsLeaflet.getNorth(),
  ];
  const zoom = map.getZoom();
  
  if (enableCluster) {
    return <ClusterLayer points={points} zoom={zoom} bounds={bounds} />;
  }
  
  // Render individual earthquake markers with full details
  return <>
    {fullData.map(q => {
      const color = filtersMode === 'depth' 
        ? markerColorByDepth(q.depth) 
        : markerColorByMagnitude(q.magnitude);
      return (
        <CircleMarker 
          key={q.id} 
          center={[q.latitude, q.longitude]} 
          radius={markerRadius(q.magnitude)}
          pathOptions={{ color, fillOpacity: 0.6 }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold">M {q.magnitude.toFixed(1)}</div>
              <div className="opacity-80">{q.place}</div>
              <div className="opacity-80">Depth: {q.depth} km</div>
              <div className="opacity-80">{formatTime(q.time)}</div>
              <a 
                href={q.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline"
              >
                View on USGS
              </a>
            </div>
          </Popup>
        </CircleMarker>
      );
    })}
  </>;
};

/**
 * Invalidate Size Helper Component
 * 
 * Forces the Leaflet map to recalculate its size when the container dimensions change.
 * Essential for fixing rendering issues when the map container is resized.
 * 
 * @returns null (invisible helper component)
 */
const InvalidateOnChange: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);
  return null;
};

export default MapView;
