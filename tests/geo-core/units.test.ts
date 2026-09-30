import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Units } from '../../src/geo-core/units';

describe('Type-Safe Physical Units & Dimensional Conversions', () => {
  it('converts knots to m/s and back invertibly', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 300, noNaN: true }), (kt) => {
        const ms = Units.knotsToMs(kt);
        const backKt = Units.msToKnots(ms);
        return Math.abs(kt - backKt) < 1e-5;
      })
    );
  });

  it('converts knots to km/h and back invertibly', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 300, noNaN: true }), (kt) => {
        const kmh = Units.knotsToKmh(kt);
        const backKt = Units.kmhToKnots(kmh);
        return Math.abs(kt - backKt) < 1e-5;
      })
    );
  });

  it('converts hPa to Pascals and back invertibly', () => {
    expect(Units.hpaToPascals(938)).toBe(93800);
    expect(Units.pascalsToHpa(93800)).toBe(938);
  });

  it('converts km to meters and back invertibly', () => {
    expect(Units.kmToMeters(45)).toBe(45000);
    expect(Units.metersToKm(45000)).toBe(45);
  });

  it('formats UTC ISO timestamps into Indian Standard Time (IST)', () => {
    const ist = Units.utcToIst('2026-10-28T14:00:00Z');
    expect(ist).toContain('IST');
    expect(ist).toContain('2026');
  });

  it('calculates physical Inverse Barometer height accurately', () => {
    const ib = Units.inverseBarometerMeters(1010, 938);
    expect(ib).toBeCloseTo(0.7344, 4);
  });
});
