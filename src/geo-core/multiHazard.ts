/**
 * Multi-Hazard Extension Engine
 * Combines Cyclonic Inundation, Flash Flooding (Rainfall), Extreme Heat Indices, and Lightning Threat.
 */

export interface MultiHazardInputs {
  districtId: string;
  surgeDepthM: number;
  rainfall24hMm: number;
  surfaceTempC: number;
  relativeHumidityPct: number;
  capeJouleKg: number; // Convective Available Potential Energy for lightning
}

export interface HazardIndices {
  cycloneSurgeIndex: number; // 0 - 100
  pluvialFloodIndex: number; // 0 - 100
  heatStressIndex: number;   // 0 - 100 (Heat Index / Wet Bulb)
  lightningThreatIndex: number; // 0 - 100
  compositeMultiHazardScore: number; // 0 - 100
  primaryThreat: 'CYCLONIC_SURGE' | 'FLASH_FLOOD' | 'EXTREME_HEAT' | 'LIGHTNING_STRIKE';
  disclaimer: string;
}

export function computeMultiHazardIndices(inputs: MultiHazardInputs): HazardIndices {
  // 1. Cyclone Surge Index (non-linear scaling up to 5m)
  const surgeIdx = Math.min(100, Math.max(0, (inputs.surgeDepthM / 5.0) * 100));

  // 2. Pluvial Flood Index (200mm in 24h = 100% threshold)
  const rainIdx = Math.min(100, Math.max(0, (inputs.rainfall24hMm / 200.0) * 100));

  // 3. Heat Index (Steadman formula approximation)
  let heatIdx = 0;
  if (inputs.surfaceTempC >= 27) {
    const hi = inputs.surfaceTempC + 0.5555 * ((inputs.relativeHumidityPct / 100) * 6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.15 + inputs.surfaceTempC))) - 10);
    heatIdx = Math.min(100, Math.max(0, ((hi - 30) / 25.0) * 100));
  }

  // 4. Lightning Index based on CAPE (Convective Available Potential Energy)
  const lightningIdx = Math.min(100, Math.max(0, (inputs.capeJouleKg / 3500.0) * 100));

  // Determine dominant threat
  const scores = [
    { type: 'CYCLONIC_SURGE' as const, val: surgeIdx },
    { type: 'FLASH_FLOOD' as const, val: rainIdx },
    { type: 'EXTREME_HEAT' as const, val: heatIdx },
    { type: 'LIGHTNING_STRIKE' as const, val: lightningIdx },
  ];
  scores.sort((a, b) => b.val - a.val);

  // Weighted composite hazard score: 50% dominant + 50% average of remainder
  const dominant = scores[0];
  const remainderAvg = (scores[1].val + scores[2].val + scores[3].val) / 3.0;
  const composite = Number(((dominant.val * 0.60) + (remainderAvg * 0.40)).toFixed(1));

  return {
    cycloneSurgeIndex: Number(surgeIdx.toFixed(1)),
    pluvialFloodIndex: Number(rainIdx.toFixed(1)),
    heatStressIndex: Number(heatIdx.toFixed(1)),
    lightningThreatIndex: Number(lightningIdx.toFixed(1)),
    compositeMultiHazardScore: composite,
    primaryThreat: dominant.type,
    disclaimer: 'Screening-level model, not an operational forecast.',
  };
}
