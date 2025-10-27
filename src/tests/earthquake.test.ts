import { markerColorByMagnitude, markerRadius, markerColorByDepth, formatTime } from '../types/earthquake';

describe('earthquake viz utils', () => {
  test('markerColorByMagnitude gives expected buckets', () => {
    expect(markerColorByMagnitude(6.1)).toBe('#a10f2b');
    expect(markerColorByMagnitude(5.2)).toBe('#d62d20');
    expect(markerColorByMagnitude(4.5)).toBe('#f17c00');
    expect(markerColorByMagnitude(3.3)).toBe('#f4b400');
    expect(markerColorByMagnitude(2.1)).toBe('#7cb342');
    expect(markerColorByMagnitude(1.9)).toBe('#43a047');
  });

  test('markerRadius scales with magnitude and has minimum', () => {
    expect(markerRadius(0)).toBe(4);
    expect(markerRadius(1)).toBe(4);
    expect(markerRadius(2)).toBe(6);
    expect(markerRadius(4)).toBe(12);
  });

  test('markerColorByDepth buckets depth scale', () => {
    expect(markerColorByDepth(5)).toBe('#2ecc71');
    expect(markerColorByDepth(20)).toBe('#27ae60');
    expect(markerColorByDepth(60)).toBe('#f1c40f');
    expect(markerColorByDepth(120)).toBe('#e67e22');
    expect(markerColorByDepth(280)).toBe('#d35400');
    expect(markerColorByDepth(500)).toBe('#8e44ad');
  });

  test('formatTime returns a string', () => {
    const s = formatTime(0);
    expect(typeof s).toBe('string');
  });
});
