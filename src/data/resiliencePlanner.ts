export interface InfrastructureProject {
  id: string;
  assetId: string;
  name: string;
  assetType: 'substation' | 'embankment' | 'bridge' | 'hospital' | 'water_treatment';
  district: string;
  costInrCrores: number;
  expectedLossAvoidanceInrCrores: number;
  benefitCostRatio: number; // Avoided Loss / Cost
  riskReductionPct: number;
  currentElevationM: number;
  proposedElevationM: number;
  hardenedStatus: boolean;
  actionType: 'RAISE_EMBANKMENT_1M' | 'ELEVATE_SUBSTATION_PLINTH' | 'INSTALL_MICROGRID' | 'SEAWALL_REVETMENT';
}

export const RESILIENCE_PROJECTS: InfrastructureProject[] = [
  {
    id: 'PROJ-PURI-01',
    assetId: 'sub-north-puri',
    name: 'Grid Substation North-Puri (220/33kV) Plinth Elevation (+1.5m)',
    assetType: 'substation',
    district: 'Puri',
    costInrCrores: 4.8,
    expectedLossAvoidanceInrCrores: 42.0,
    benefitCostRatio: 8.75,
    riskReductionPct: 75,
    currentElevationM: 3.2,
    proposedElevationM: 4.7,
    hardenedStatus: false,
    actionType: 'ELEVATE_SUBSTATION_PLINTH',
  },
  {
    id: 'PROJ-PURI-02',
    assetId: 'emb-chilika-north',
    name: 'Astaranga-Kakatpur Coastal Embankment 1m Heightening & Geo-textile Armoring',
    assetType: 'embankment',
    district: 'Puri',
    costInrCrores: 14.5,
    expectedLossAvoidanceInrCrores: 165.0,
    benefitCostRatio: 11.38,
    riskReductionPct: 68,
    currentElevationM: 3.8,
    proposedElevationM: 4.8,
    hardenedStatus: false,
    actionType: 'RAISE_EMBANKMENT_1M',
  },
  {
    id: 'PROJ-PURI-03',
    assetId: 'hosp-puri-dist',
    name: 'Puri District Hospital Solar Microgrid & Floodwall Barrier',
    assetType: 'hospital',
    district: 'Puri',
    costInrCrores: 2.2,
    expectedLossAvoidanceInrCrores: 28.5,
    benefitCostRatio: 12.95,
    riskReductionPct: 88,
    currentElevationM: 5.1,
    proposedElevationM: 5.8,
    hardenedStatus: false,
    actionType: 'INSTALL_MICROGRID',
  },
  {
    id: 'PROJ-PURI-04',
    assetId: 'brg-nh316-coastal',
    name: 'Mahanadi Coastal Highway (NH-316) Approach Road Raising & Scour Protection',
    assetType: 'bridge',
    district: 'Puri',
    costInrCrores: 8.4,
    expectedLossAvoidanceInrCrores: 64.0,
    benefitCostRatio: 7.62,
    riskReductionPct: 60,
    currentElevationM: 2.9,
    proposedElevationM: 4.2,
    hardenedStatus: false,
    actionType: 'SEAWALL_REVETMENT',
  },
];
