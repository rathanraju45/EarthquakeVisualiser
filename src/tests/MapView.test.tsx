import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EarthquakeProvider } from '../context/EarthquakeContext';
import MapView from '../components/MapView';

// Mock Leaflet CSS import side-effects
jest.mock('leaflet/dist/leaflet.css', () => ({}), { virtual: true });
jest.mock('use-supercluster', () => () => ({
  clusters: [
    { id: 'p1', geometry: { coordinates: [20, 10] }, properties: { cluster: false, quakeId: 'id1', magnitude: 3.5 } },
  ],
}));

// Mock MapContainer internals to avoid needing a DOM for Leaflet rendering
jest.mock('react-leaflet', () => {
  const React = require('react');
  return {
    __esModule: true,
    MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
    TileLayer: () => <div data-testid="tile" />,
    CircleMarker: ({ children }: any) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
    useMap: () => ({ getBounds: () => ({ getWest: () => -1, getSouth: () => -1, getEast: () => 1, getNorth: () => 1 }), getZoom: () => 2, setView: jest.fn(), invalidateSize: jest.fn() }),
    ZoomControl: () => <div data-testid="zoom" />,
  };
});

// Mock fetch service to provide deterministic data
jest.mock('../services/usgs', () => ({
  fetchEarthquakes: async () => ({
    metadata: { generated: Date.now(), url: '', title: '', count: 1 },
    quakes: [
      { id: 'id1', latitude: 10, longitude: 20, depth: 5, magnitude: 3.5, place: 'Place', time: 1000, url: '#' },
    ],
  }),
}));

test('renders map and at least one marker when data loads', async () => {
  render(
    <EarthquakeProvider>
      <MapView />
    </EarthquakeProvider>
  );

  expect(screen.getByTestId('map')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getAllByTestId('marker').length).toBeGreaterThan(0);
  });
});
