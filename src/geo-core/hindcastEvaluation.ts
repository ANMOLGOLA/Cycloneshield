/**
 * Post-Event Model Evaluation & Skill Regression Engine
 * Computes RMSE, Bias, Probability of Detection (POD / Hit Rate), False Alarm Ratio (FAR),
 * and Critical Success Index (CSI) against observed tide gauges.
 */

export interface HindcastObservation {
  eventId: string;
  stationName: string;
  observedSurgeM: number;
  modeledSurgeM: number;
}

export interface SkillMetrics {
  rmse: number;
  bias: number;
  hitRate: number; // POD
  falseAlarmRatio: number; // FAR
  criticalSuccessIndex: number; // CSI
  isSkillRegression: boolean;
}

export const HISTORICAL_VALIDATION_SET: HindcastObservation[] = [
  { eventId: 'FANI-2019', stationName: 'Puri Tide Gauge', observedSurgeM: 4.60, modeledSurgeM: 4.80 },
  { eventId: 'AMPHAN-2020', stationName: 'Sagar Island Gauge', observedSurgeM: 5.40, modeledSurgeM: 5.60 },
  { eventId: 'YAAS-2021', stationName: 'Dhamra Port Gauge', observedSurgeM: 3.80, modeledSurgeM: 3.65 },
  { eventId: 'MICHAUNG-2023', stationName: 'Bapatla Coastal AWS', observedSurgeM: 2.10, modeledSurgeM: 2.25 },
  { eventId: 'REMAL-2024', stationName: 'Khepupara Station', observedSurgeM: 3.20, modeledSurgeM: 3.35 },
];

export function computeModelSkillScores(records: HindcastObservation[] = HISTORICAL_VALIDATION_SET): SkillMetrics {
  const n = records.length;
  if (n === 0) {
    return { rmse: 0, bias: 0, hitRate: 1, falseAlarmRatio: 0, criticalSuccessIndex: 1, isSkillRegression: false };
  }

  let sumSquaredDiff = 0;
  let sumDiff = 0;
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;

  for (const rec of records) {
    const diff = rec.modeledSurgeM - rec.observedSurgeM;
    sumSquaredDiff += diff * diff;
    sumDiff += diff;

    // Threshold classification for surge exceedance > 2.5m
    const obsExceed = rec.observedSurgeM >= 2.5;
    const modExceed = rec.modeledSurgeM >= 2.5;

    if (obsExceed && modExceed) hits++;
    else if (obsExceed && !modExceed) misses++;
    else if (!obsExceed && modExceed) falseAlarms++;
  }

  const rmse = Number(Math.sqrt(sumSquaredDiff / n).toFixed(3));
  const bias = Number((sumDiff / n).toFixed(3));
  const hitRate = hits + misses > 0 ? Number((hits / (hits + misses)).toFixed(3)) : 1.0;
  const falseAlarmRatio = hits + falseAlarms > 0 ? Number((falseAlarms / (hits + falseAlarms)).toFixed(3)) : 0.0;
  const criticalSuccessIndex = hits + misses + falseAlarms > 0
    ? Number((hits / (hits + misses + falseAlarms)).toFixed(3))
    : 1.0;

  // Operational skill regression flag: RMSE > 0.45m or CSI < 0.75 triggers failure
  const isSkillRegression = rmse > 0.45 || criticalSuccessIndex < 0.75;

  return {
    rmse,
    bias,
    hitRate,
    falseAlarmRatio,
    criticalSuccessIndex,
    isSkillRegression,
  };
}
