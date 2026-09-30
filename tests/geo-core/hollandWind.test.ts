import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateCoriolisParameter,
  calculateHollandWindSpeedKt,
  computeHollandIsotachs,
} from '../../src/geo-core/hollandWind';
import { HollandParameters } from '../../src/types/cyclone';

describe('Holland (1980) Parametric Wind Field Core', () => {
  const defaultParams: HollandParameters = {
    B: 1.55,
    RmaxKm: 34,
    Pn: 1010,
    Pc: 938,
    rho_a: 1.15,
    translationSpeedKt: 12,
    translationDirectionDeg: 340,
  };

  describe('Coriolis Parameter', () => {
    it('should calculate 0 at equator (lat = 0)', () => {
      const f = calculateCoriolisParameter(0);
      expect(f).toBeCloseTo(0, 6);
    });

    it('should be positive and within physical bounds for northern hemisphere Bay of Bengal', () => {
      const f = calculateCoriolisParameter(19.5);
      expect(f).toBeGreaterThan(0);
      expect(f).toBeLessThan(1.5e-4);
    });
  });

  describe('Wind Speed Profile Calculations', () => {
    it('returns 0 for radius <= 0.1 km (eye center boundary)', () => {
      expect(calculateHollandWindSpeedKt(0, defaultParams)).toBe(0);
      expect(calculateHollandWindSpeedKt(0.05, defaultParams)).toBe(0);
    });

    it('calculates peak wind near Rmax', () => {
      const vAtRmax = calculateHollandWindSpeedKt(34, defaultParams, 19.5, 90);
      const vFar = calculateHollandWindSpeedKt(250, defaultParams, 19.5, 90);
      expect(vAtRmax).toBeGreaterThan(100);
      expect(vAtRmax).toBeGreaterThan(vFar);
    });

    it('demonstrates asymmetric wind field due to translation speed', () => {
      // In northern hemisphere, wind is stronger on right side (relative to motion)
      const windRight = calculateHollandWindSpeedKt(34, defaultParams, 19.5, 340 + 90); // right quadrant
      const windLeft = calculateHollandWindSpeedKt(34, defaultParams, 19.5, 340 - 90); // left quadrant
      expect(windRight).toBeGreaterThanOrEqual(windLeft);
    });
  });

  describe('computeHollandIsotachs', () => {
    it('computes valid isotach radii and continuous radial profile', () => {
      const result = computeHollandIsotachs(defaultParams, 19.5);
      expect(result.profile.length).toBeGreaterThan(50);
      expect(result.vMaxKt).toBeGreaterThan(100);
      expect(result.rMaxKm).toBe(34);
      expect(result.r34ktKm).toBeGreaterThanOrEqual(result.r50ktKm);
      expect(result.r50ktKm).toBeGreaterThanOrEqual(result.r64ktKm);
    });
  });

  describe('Property-Based Invariants (fast-check)', () => {
    it('always produces non-negative wind speeds for physically valid cyclone inputs', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 500, noNaN: true }),
          fc.double({ min: 1.0, max: 2.5, noNaN: true }), // B
          fc.double({ min: 10, max: 80, noNaN: true }),  // Rmax
          fc.double({ min: 880, max: 1000, noNaN: true }), // Pc
          fc.double({ min: 0, max: 40, noNaN: true }), // Translation speed
          (rKm, B, RmaxKm, Pc, translationSpeedKt) => {
            const params: HollandParameters = {
              B,
              RmaxKm,
              Pn: 1010,
              Pc,
              rho_a: 1.15,
              translationSpeedKt,
              translationDirectionDeg: 0,
            };
            const wind = calculateHollandWindSpeedKt(rKm, params, 19.5, 90);
            return Number.isFinite(wind) && wind >= 0 && wind < 400;
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
