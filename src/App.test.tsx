import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock USGS service to avoid network and ESM axios import
jest.mock('./services/usgs', () => ({
  fetchEarthquakes: async () => ({
    metadata: { generated: Date.now(), url: '', title: '', count: 1 },
    quakes: [
      { id: 'id1', latitude: 0, longitude: 0, depth: 10, magnitude: 2.5, place: 'X', time: 1000, url: '#' },
    ],
  }),
}));

// Mock react-leaflet to avoid ESM import and DOM requirements
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
jest.mock('leaflet/dist/leaflet.css', () => ({}), { virtual: true });
jest.mock('use-supercluster', () => () => ({ clusters: [] }));

test('renders app title', async () => {
  render(<App />);
  expect(screen.getByText(/Earthquake Visualizer/i)).toBeInTheDocument();
  await waitFor(() => {
    // ensure map/subcomponents mounted by waiting for footer text
    expect(screen.getByText(/Data: USGS/i)).toBeInTheDocument();
  });
});
