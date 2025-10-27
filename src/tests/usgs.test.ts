import { fetchEarthquakes } from '../services/usgs';

jest.mock('axios', () => ({ get: jest.fn() }));
const mockedAxios: any = require('axios');

describe('fetchEarthquakes', () => {
  it('parses USGS feed into EarthquakeFeed', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {
      type: 'FeatureCollection',
      metadata: { generated: 1, title: 'test', count: 1 },
      features: [
        {
          id: 'abc',
          geometry: { coordinates: [10, 20, 5] },
          properties: { mag: 3.2, place: 'Somewhere', time: 1000, url: 'http://example.com' },
        },
      ],
    }} as any);

    const feed = await fetchEarthquakes(0);
    expect(feed.metadata.count).toBe(1);
    expect(feed.quakes[0]).toMatchObject({
      id: 'abc', latitude: 20, longitude: 10, depth: 5, magnitude: 3.2,
    });
  });
});
