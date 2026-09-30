import { describe, it, expect } from 'vitest';
import { generateProbabilisticSurgeEnsemble } from '../../src/geo-core/probabilisticEnsemble';
import { SurgeSimulationInputs } from '../../src/geo-core/surgeBathtub';
import { HollandParameters } from '../../src/types/cyclone';

describe('Probabilistic Ensemble Model', () => {
  const baseInputs: SurgeSimulationInputs = {
    centralPressureHpa: 938,
    ambientPressureHpa: 1010,
    maxWindSpeedKt: 135,
    tidePhase: 'Mean High Water',
  };

  const hollandParams: HollandParameters = {
    B: 1.55,
    RmaxKm: 34,
    Pn: 1010,
    Pc: 938,
    rho_a: 1.15,
    translationSpeedKt: 12,
    translationDirectionDeg: 340,
  };

  it('generates 50 ensemble members with realistic statistical spread', () => {
    const ensemble = generateProbabilisticSurgeEnsemble(baseInputs, hollandParams, 50);
    expect(ensemble.members.length).toBe(50);
    expect(ensemble.p90SurgeM).toBeGreaterThanOrEqual(ensemble.p50SurgeM);
    expect(ensemble.p50SurgeM).toBeGreaterThanOrEqual(ensemble.p10SurgeM);
    expect(ensemble.probSurgeGt2m).toBeGreaterThan(0);
    expect(ensemble.probSurgeGt2m).toBeLessThanOrEqual(100);
    expect(ensemble.disclaimer).toContain('Screening-level model, not an operational forecast');
  });

  it('preserves physical bounding constraints across all ensemble members', () => {
    const ensemble = generateProbabilisticSurgeEnsemble(baseInputs, hollandParams, 50);
    for (const member of ensemble.members) {
      expect(member.peakSurgeM).toBeGreaterThan(0);
      expect(member.peakSurgeM).toBeLessThan(12);
      expect(member.peakWindKt).toBeGreaterThan(50);
    }
  });
});
