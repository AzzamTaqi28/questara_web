import { describe, it, expect } from 'vitest';
import { calculateDistanceMeters } from './distance.js';

describe('calculateDistanceMeters', () => {
  it('returns 0 for identical coordinates', () => {
    const result = calculateDistanceMeters(
      { lat: -7.2458, lng: 112.7378 },
      { lat: -7.2458, lng: 112.7378 }
    );
    expect(result).toBe(0);
  });

  it('calculates approximate distance between two known points', () => {
    // Museum 10 November (-7.2458, 112.7378) and Tugu Pahlawan (-7.2473, 112.7389)
    const result = calculateDistanceMeters(
      { lat: -7.2458, lng: 112.7378 },
      { lat: -7.2473, lng: 112.7389 }
    );
    // Should be roughly ~210 meters
    expect(result).toBeGreaterThan(150);
    expect(result).toBeLessThan(300);
  });

  it('is symmetric', () => {
    const d1 = calculateDistanceMeters({ lat: -7.2, lng: 112.7 }, { lat: -7.3, lng: 112.8 });
    const d2 = calculateDistanceMeters({ lat: -7.3, lng: 112.8 }, { lat: -7.2, lng: 112.7 });
    expect(d1).toBe(d2);
  });
});