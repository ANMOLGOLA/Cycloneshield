export type CycloneCategory = 
  | 'Deep Depression' 
  | 'Cyclonic Storm' 
  | 'Severe Cyclonic Storm' 
  | 'Very Severe Cyclonic Storm' 
  | 'Extremely Severe Cyclonic Storm' 
  | 'Super Cyclonic Storm'
  | 'Category 1' | 'Category 2' | 'Category 3' | 'Category 4 Severe' | 'Category 5 Super';

export interface TrackPoint {
  timeOffsetHours: number; // e.g. -72 to +24
  label: string; // "T-72h", "T-18h (Current)", "Landfall"
  lat: number;
  lon: number;
  windSpeedKt: number;
  centralPressureHpa: number;
  surgePeakM: number;
  rainfallMmHr: number;
  coneRadiusKm: number;
  stage: string;
  isLandfall?: boolean;
  timestampUtc: string;
}

export interface HollandParameters {
  B: number;         // Peakedness parameter (typically 1.2 - 2.1)
  RmaxKm: number;    // Radius of maximum winds (25 - 65 km)
  Pn: number;        // Ambient pressure (typically 1010 hPa)
  Pc: number;        // Central pressure (hPa)
  rho_a: number;     // Air density (1.15 kg/m³)
  translationSpeedKt: number;
  translationDirectionDeg: number;
}

export interface CycloneEvent {
  id: string;
  name: string;
  year: number;
  category: CycloneCategory;
  basin: 'Bay of Bengal' | 'Arabian Sea';
  isActive: boolean;
  currentTimelineOffset: number; // e.g. -18
  windSpeedKt: number;
  centralPressureHpa: number;
  movement: string; // e.g. "NNW @ 12 kt"
  coastDistanceKm: number;
  landfallEta: string; // "28 Oct, 14:00 UTC"
  landfallLocation: string; // "South of Puri, Odisha"
  holland: HollandParameters;
  track: TrackPoint[];
  bulletinSummary: string;
  sources: string[];
}

export interface DistrictRisk {
  id: string;
  name: string;
  state: 'Odisha' | 'West Bengal' | 'Andhra Pradesh';
  rank: number;
  populationMillions: number;
  populationExact: number;
  evacuatedCount: number;
  targetEvacuation: number;
  sheltersActive: number;
  sheltersTotal: number;
  shelterCapacityUsedPct: number;
  hazardScore: number;       // 0 - 100
  exposureScore: number;     // 0 - 100
  vulnerabilityScore: number;// 0 - 100
  overallScore: number;      // Hazard * 0.45 + Exposure * 0.35 + Vuln * 0.20
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  trend: 'up' | 'flat' | 'down';
  peakSurgeM: number;
  peakWindKt: number;
  rainfallAccumMm: number;
  coastalLengthKm: number;
  avgElevationM: number;
  demInundationAreaKm2: number;
  parametricPayoutReadiness: 'TRIGGERED' | 'ELIGIBLE_SOON' | 'MONITORING';
  parametricPayoutAmountUsd: number;
}

export interface CriticalAsset {
  id: string;
  name: string;
  type: 'substation' | 'hospital' | 'bridge' | 'shelter' | 'water_treatment' | 'telecom';
  districtId: string;
  lat: number;
  lon: number;
  elevationM: number;
  status: 'operational' | 'at_risk' | 'tripped' | 'flooded' | 'closed';
  hazardExposurePct: number;
  backupGenStatus?: string;
  failoverStatus?: string;
  dependentAssetNames?: string[];
  notes?: string;
}

export interface CascadingRiskItem {
  id: string;
  primaryAsset: string;
  primaryType: 'substation' | 'bridge' | 'telecom';
  statusBadge: 'TRIPPED' | 'AT RISK' | 'ISOLATED' | 'COMPROMISED';
  badgeColor: 'error' | 'amber' | 'primary';
  downstreamImpacts: {
    target: string;
    statusText: string;
    statusTone: 'error' | 'amber' | 'emerald';
  }[];
}

export interface TelemetryStation {
  id: string;
  name: string;
  type: 'buoy' | 'aws' | 'tide_gauge' | 'doppler_radar';
  lat: number;
  lon: number;
  pressureHpa: number;
  windSpeedKt: number;
  gustKt: number;
  waveHeightM?: number;
  waterLevelM?: number;
  seaSurfaceTempC?: number;
  lastUpdated: string;
  batteryPct: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface CapAlertData {
  identifier: string;
  sender: string;
  sent: string;
  status: 'Actual' | 'Draft';
  msgType: 'Alert' | 'Update' | 'Cancel';
  scope: 'Public' | 'Restricted';
  category: 'Met' | 'Safety';
  urgency: 'Immediate' | 'Expected' | 'Future';
  severity: 'Extreme' | 'Severe' | 'Moderate';
  certainty: 'Observed' | 'Likely' | 'Possible';
  event: string;
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  dutyOfficerApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  auditHash?: string;
  dispatchedChannels?: string[];
  multilingual: {
    [lang: string]: {
      headline: string;
      description: string;
      instruction: string;
    };
  };
}

export interface ParametricPolicy {
  policyId: string;
  districtId: string;
  districtName: string;
  insuredEntity: string;
  windSpeedThresholdKt: number;
  surgeDepthThresholdM: number;
  currentObservedWindKt: number;
  currentObservedSurgeM: number;
  triggerStatus: 'TRIGGERED' | 'PENDING_VALIDATION' | 'MONITORING';
  payoutCapUsd: number;
  payoutCalculatedUsd: number;
  liquidityPoolRemainingUsd: number;
  oracleFeeds: string[];
}
