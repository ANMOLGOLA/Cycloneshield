import { describe, it, expect } from 'vitest';
import { computeModelSkillScores, HISTORICAL_VALIDATION_SET } from '../../src/geo-core/hindcastEvaluation';
import { computeMultiHazardIndices } from '../../src/geo-core/multiHazard';

describe('Model Skill Verification & Multi-Hazard Core', () => {
  describe('Hindcast Skill Scoring & Regression Gate', () => {
    it('achieves target operational skill scores across historical cyclones', () => {
      const metrics = computeModelSkillScores(HISTORICAL_VALIDATION_SET);
      expect(metrics.rmse).toBeLessThan(0.35); // Low RMSE
      expect(metrics.criticalSuccessIndex).toBeGreaterThanOrEqual(0.80); // High CSI
      expect(metrics.falseAlarmRatio).toBeLessThan(0.15); // Low FAR
      expect(metrics.isSkillRegression).toBe(false); // Regression gate passed
    });

    it('triggers skill regression flag when hypothetical model error spikes', () => {
      const degradedSet = [
        { eventId: 'FANI', stationName: 'Puri', observedSurgeM: 4.6, modeledSurgeM: 1.0 }, // severe miss
        { eventId: 'AMPHAN', stationName: 'Sagar', observedSurgeM: 5.4, modeledSurgeM: 1.2 },
      ];
      const metrics = computeModelSkillScores(degradedSet);
      expect(metrics.isSkillRegression).toBe(true);
    });
  });

  describe('Multi-Hazard Calculation', () => {
    it('computes composite multi-hazard index and identifies dominant threat', () => {
      const res = computeMultiHazardIndices({
        districtId: 'puri',
        surgeDepthM: 4.8,
        rainfall24hMm: 180,
        surfaceTempC: 32,
        relativeHumidityPct: 85,
        capeJouleKg: 2800,
      });

      expect(res.compositeMultiHazardScore).toBeGreaterThan(70);
      expect(res.cycloneSurgeIndex).toBeGreaterThan(90);
      expect(res.primaryThreat).toBe('CYCLONIC_SURGE');
      expect(res.disclaimer).toContain('Screening-level model, not an operational forecast');
    });
  });
});
