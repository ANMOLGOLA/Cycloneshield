import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeCompositeRiskScore, DEFAULT_RISK_WEIGHTS } from '../../src/geo-core/riskScoring';

describe('Risk Scoring Engine', () => {
  it('correctly calculates weighted composite score for critical threshold', () => {
    // 90 * 0.45 (40.5) + 85 * 0.35 (29.75) + 80 * 0.20 (16.0) = 86.25 -> 86.3
    const res = computeCompositeRiskScore(90, 85, 80);
    expect(res.score).toBe(86.3);
    expect(res.level).toBe('CRITICAL');
    expect(res.breakdown.hazardContribution).toBe(40.5);
    expect(res.breakdown.exposureContribution).toBe(29.7);
    expect(res.breakdown.vulnerabilityContribution).toBe(16.0);
  });

  it('assigns correct risk category levels', () => {
    expect(computeCompositeRiskScore(90, 90, 90).level).toBe('CRITICAL'); // >= 78
    expect(computeCompositeRiskScore(70, 60, 60).level).toBe('HIGH');     // >= 58
    expect(computeCompositeRiskScore(45, 45, 45).level).toBe('MODERATE'); // >= 38
    expect(computeCompositeRiskScore(20, 20, 20).level).toBe('LOW');      // < 38
  });

  describe('Property-Based Invariants (fast-check)', () => {
    it('always outputs scores bounded strictly in [0, 100]', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (hazard, exposure, vuln) => {
            const res = computeCompositeRiskScore(hazard, exposure, vuln);
            return res.score >= 0 && res.score <= 100 && ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(res.level);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('is strictly monotonic: increasing hazard never decreases overall risk', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 80, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 1, max: 20, noNaN: true }),
          (h, e, v, delta) => {
            const res1 = computeCompositeRiskScore(h, e, v);
            const res2 = computeCompositeRiskScore(h + delta, e, v);
            return res2.score >= res1.score;
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
