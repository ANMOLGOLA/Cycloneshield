/**
 * Risk Scoring Engine
 * Formula: Risk = (Hazard * 0.45) + (Exposure * 0.35) + (Vulnerability * 0.20)
 * Fully transparent, auditable weights.
 */

export interface RiskWeights {
  hazardWeight: number;      // 0.45
  exposureWeight: number;    // 0.35
  vulnerabilityWeight: number; // 0.20
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  hazardWeight: 0.45,
  exposureWeight: 0.35,
  vulnerabilityWeight: 0.20,
};

export function computeCompositeRiskScore(
  hazardScore: number,       // 0 - 100
  exposureScore: number,     // 0 - 100
  vulnerabilityScore: number,// 0 - 100
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
): {
  score: number;
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  breakdown: {
    hazardContribution: number;
    exposureContribution: number;
    vulnerabilityContribution: number;
  };
} {
  const hContrib = hazardScore * weights.hazardWeight;
  const eContrib = exposureScore * weights.exposureWeight;
  const vContrib = vulnerabilityScore * weights.vulnerabilityWeight;
  const total = Number((hContrib + eContrib + vContrib).toFixed(1));

  let level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (total >= 78) level = 'CRITICAL';
  else if (total >= 58) level = 'HIGH';
  else if (total >= 38) level = 'MODERATE';

  return {
    score: Math.min(100, Math.max(0, total)),
    level,
    breakdown: {
      hazardContribution: Number(hContrib.toFixed(1)),
      exposureContribution: Number(eContrib.toFixed(1)),
      vulnerabilityContribution: Number(vContrib.toFixed(1)),
    },
  };
}
