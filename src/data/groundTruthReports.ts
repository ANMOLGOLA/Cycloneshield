export interface GroundTruthReport {
  id: string;
  sourceType: 'CITIZEN_PHOTO' | 'VOLUNTEER_FIELD_SQUAD' | 'SENTINEL_1_SAR' | 'DRONE_SURVEY';
  districtId: string;
  locationName: string;
  lat: number;
  lon: number;
  observedInundationM: number;
  reportedTimeAgo: string;
  trustScorePct: number; // Bayesian anti-spam score 0-100%
  verificationStatus: 'VERIFIED_BY_OFFICER' | 'AI_CONFIRMED' | 'PENDING_TRIAGE';
  description: string;
  isEmbankmentBreach: boolean;
}

export const GROUND_TRUTH_REPORTS: GroundTruthReport[] = [
  {
    id: 'REP-PURI-01',
    sourceType: 'SENTINEL_1_SAR',
    districtId: 'puri',
    locationName: 'Brahmagiri Estuary & Chilika Mouth',
    lat: 19.78,
    lon: 85.65,
    observedInundationM: 3.8,
    reportedTimeAgo: '18m ago',
    trustScorePct: 98,
    verificationStatus: 'AI_CONFIRMED',
    description: 'Sentinel-1 Dual-Pol SAR backscatter amplitude indicates 42 km² saline flood footprint.',
    isEmbankmentBreach: true,
  },
  {
    id: 'REP-PURI-02',
    sourceType: 'VOLUNTEER_FIELD_SQUAD',
    districtId: 'puri',
    locationName: 'Astaranga Fishing Jetty',
    lat: 19.98,
    lon: 86.25,
    observedInundationM: 2.1,
    reportedTimeAgo: '42m ago',
    trustScorePct: 94,
    verificationStatus: 'VERIFIED_BY_OFFICER',
    description: 'ODRAF rescue squad confirms 2.1m sea surge overtopping village access bund.',
    isEmbankmentBreach: false,
  },
  {
    id: 'REP-PURI-03',
    sourceType: 'CITIZEN_PHOTO',
    districtId: 'puri',
    locationName: 'Puri Grand Road Corridor',
    lat: 19.81,
    lon: 85.83,
    observedInundationM: 0.75,
    reportedTimeAgo: '1h ago',
    trustScorePct: 88,
    verificationStatus: 'VERIFIED_BY_OFFICER',
    description: 'Geotagged citizen photo showing 0.75m standing water near Swargadwar.',
    isEmbankmentBreach: false,
  },
];
