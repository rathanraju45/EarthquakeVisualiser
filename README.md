# Earthquake Visualizer

Interactive, client-only map that visualizes the last 24 hours of earthquakes from the USGS GeoJSON feed using React-Leaflet.

Data source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

## Live Demo

🌍 **Live:** https://earthquakevisualiser.netlify.app

## Stack
- React + TypeScript (Create React App)
- React-Leaflet + Leaflet
- Axios
- Tailwind CSS

## Requirements

- Node.js 18+ and npm 10+ are recommended.

## Clone and run locally

```bash
# 1) Clone the repository
git clone https://github.com/rathanraju45/EarthquakeVisualiser.git
cd earthquake-visualizer

# 2) Install dependencies
npm install

# 3) Start the dev server (http://localhost:3000)
npm start

# 4) Run tests (optional)
npm test

# 5) Build for production (optional)
npm run build
```

## Features
- Map with circle markers sized and colored by magnitude
- Popups with magnitude, place, depth, local time, and USGS link
- Filters: min magnitude, time window (1h/6h/12h/24h)
- In-memory caching with TTL (default 5 minutes)

## How to use

- Pan/zoom the map to explore. Click any marker to view details.
- Desktop: use the right sidebar to adjust filters (min magnitude, time window, cluster toggle, color mode) and view the summary and legend.
- Mobile/Tablet: tap the “Filters” button (bottom-right) to open a bottom popup (60% height) with filters, summary, and legend. Tap outside or press Esc to close.
- Use the Refresh button in the header to fetch the latest data from USGS (bypasses cache).

## Deployment

Any static host will work (Netlify, Vercel, GitHub Pages). Example:

- Netlify
	- Build command: `npm run build`
	- Publish directory: `build/`
- GitHub Pages
	- Build locally: `npm run build`
	- Push the `build/` folder contents to a `gh-pages` branch (or use a GitHub Action)

## Notes
- No backend; the app fetches USGS directly from the browser
- Leaflet styles are imported in `src/index.css`
- If you run into CORS or network issues, try again later—availability relies on USGS.
