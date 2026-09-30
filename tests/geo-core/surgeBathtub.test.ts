import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateStormSurge, SurgeSimulationInputs } from '../../src/geo-core/surgeBathtub';

describe('Storm Surge & Bathtub Inundation Core', () => {
  const severeInputs: SurgeSimulationInputs = {
    centralPressureHpa: 938,
    ambientPressureHpa: 1010,
    maxWindSpeedKt: 135,
    tidePhase: 'Mean High Water',
  };

  it('computes realistic total water level composed of all physical components', () => {
    const res = calculateStormSurge(severeInputs);
    expect(res.totalWaterLevelM).toBeGreaterThan(3.5);
    expect(res.totalWaterLevelM).toBeLessThan(7.5);
    expect(res.inverseBarometerM).toBeGreaterThan(0.5);
    expect(res.windSetupM).toBeGreaterThan(1.0);
    expect(res.waveSetupM).toBeGreaterThan(0.2);
    expect(res.astronomicalTideM).toBe(1.25);
    expect(res.uncertaintyBandM).toBe(0.6);
  });

  it('must preserve screening-level disclaimer for life safety honesty', () => {
    const res = calculateStormSurge(severeInputs);
    expect(res.disclaimer).toContain('Screening-level model, not an operational forecast');
  });

  it('correctly models decaying inundation depth inland due to topography and roughness', () => {
    const res = calculateStormSurge(severeInputs);
    expect(res.depthAtDistanceKm.length).toBe(21); // 0 to 20 km

    const coastDepth = res.depthAtDistanceKm[0].floodDepthM;
    const inlandDepth = res.depthAtDistanceKm[15].floodDepthM;
    expect(coastDepth).toBeGreaterThanOrEqual(inlandDepth);
  });

  it('adjusts astronomical tide correctly based on tide phase', () => {
    const springRes = calculateStormSurge({ ...severeInputs, tidePhase: 'Spring High Tide' });
    const neapRes = calculateStormSurge({ ...severeInputs, tidePhase: 'Neap Low Tide' });
    expect(springRes.totalWaterLevelM).toBeGreaterThan(neapRes.totalWaterLevelM);
    expect(springRes.astronomicalTideM).toBe(1.95);
    expect(neapRes.astronomicalTideM).toBe(-0.45);
  });

  describe('Property-Based Invariants (fast-check)', () => {
    it('always generates strictly non-negative flood depths and finite values', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 880, max: 1005, noNaN: true }),
          fc.double({ min: 20, max: 180, noNaN: true }),
          fc.constantFrom('Spring High Tide', 'Mean High Water', 'Mean Sea Level', 'Neap Low Tide') as fc.Arbitrary<SurgeSimulationInputs['tidePhase']>,
          (centralPressureHpa, maxWindSpeedKt, tidePhase) => {
            const res = calculateStormSurge({
              centralPressureHpa,
              ambientPressureHpa: 1010,
              maxWindSpeedKt,
              tidePhase,
            });

            const validTotals = Number.isFinite(res.totalWaterLevelM) && res.totalWaterLevelM >= -2.0 && res.totalWaterLevelM <= 15.0;
            const validDepths = res.depthAtDistanceKm.every(
              (pt) => Number.isFinite(pt.floodDepthM) && pt.floodDepthM >= 0
            );
            return validTotals && validDepths && res.inundationFootprintKm2 >= 0;
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
