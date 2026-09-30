import { CriticalAsset, CascadingRiskItem } from '../types/cyclone';

export const CRITICAL_ASSETS: CriticalAsset[] = [
  {
    id: 'substation-puri-north',
    name: 'Grid Substation North-Puri (220/33kV)',
    type: 'substation',
    districtId: 'puri',
    lat: 19.82,
    lon: 85.82,
    elevationM: 3.2,
    status: 'tripped',
    hazardExposurePct: 96,
    notes: 'Inundation breached perimeter bund; 220kV busbar trip triggered at T-19h to prevent transformer explosion.',
    dependentAssetNames: ['Water Treatment Plant #2', 'Puri General Hospital Grid', 'Puri Railway Signal Station']
  },
  {
    id: 'hospital-puri-general',
    name: 'Puri District Headquarters Hospital',
    type: 'hospital',
    districtId: 'puri',
    lat: 19.805,
    lon: 85.815,
    elevationM: 5.1,
    status: 'at_risk',
    hazardExposurePct: 88,
    backupGenStatus: 'Diesel Gen #1 & #2 Active (42h fuel reserve remaining)',
    failoverStatus: 'Tier-1 Microgrid Failover Active',
    notes: 'ICU and maternity wards operating on isolated microgrid; auxiliary ward oxygen plant secured.'
  },
  {
    id: 'water-plant-puri-2',
    name: 'Municipal Water Treatment Plant #2',
    type: 'water_treatment',
    districtId: 'puri',
    lat: 19.835,
    lon: 85.83,
    elevationM: 3.8,
    status: 'at_risk',
    hazardExposurePct: 92,
    backupGenStatus: 'Backup Generator Active (750kVA)',
    failoverStatus: 'Pumping capacity reduced to 45% of peak throughput',
    notes: 'Chlorine supply elevated above 5m surge line.'
  },
  {
    id: 'bridge-mahanadi-highway',
    name: 'Mahanadi Coastal Highway Bridge (NH-316)',
    type: 'bridge',
    districtId: 'puri',
    lat: 20.08,
    lon: 85.92,
    elevationM: 4.5,
    status: 'at_risk',
    hazardExposurePct: 94,
    notes: 'Water level 0.4m below girder soffit. Gale force crosswinds (85 kt) exceeding vehicle stability envelope.',
    dependentAssetNames: ['Evacuation Route Alpha', 'Northern Relief Corridor']
  },
  {
    id: 'shelter-puri-cluster-4',
    name: 'Astaranga Multipurpose Cyclone Shelter #4',
    type: 'shelter',
    districtId: 'puri',
    lat: 19.98,
    lon: 86.25,
    elevationM: 6.8,
    status: 'operational',
    hazardExposurePct: 75,
    backupGenStatus: 'Solar + Battery Inverter Operational',
    notes: 'Capacity: 1,500 evacuees. Current occupancy: 1,460 (97%). Community kitchen functioning.'
  },
  {
    id: 'substation-bhubaneswar-south',
    name: 'Bhubaneswar South Substation (400kV)',
    type: 'substation',
    districtId: 'khordha',
    lat: 20.24,
    lon: 85.78,
    elevationM: 28.0,
    status: 'operational',
    hazardExposurePct: 62,
    backupGenStatus: 'Standby Ready',
    notes: 'Serving AIIMS Bhubaneswar and state emergency operations center.'
  },
  {
    id: 'bridge-chilika-causeway',
    name: 'Chilika Coastal Causeway & Ferry Pier',
    type: 'bridge',
    districtId: 'ganjam',
    lat: 19.55,
    lon: 85.25,
    elevationM: 2.1,
    status: 'flooded',
    hazardExposurePct: 98,
    notes: 'Submerged under 1.8m brackish surge; Satapada vehicular link completely halted.',
    dependentAssetNames: ['Satapada Evacuation Spur', 'Chilika Marine Shelter 2']
  },
  {
    id: 'port-paradeep-terminal',
    name: 'Paradeep Port Iron & Bulk Terminal',
    type: 'telecom',
    districtId: 'jagatsinghpur',
    lat: 20.26,
    lon: 86.67,
    elevationM: 3.5,
    status: 'at_risk',
    hazardExposurePct: 89,
    notes: 'Harbor operations suspended; 14 vessels de-berthed to high seas; shore cranes locked down.'
  }
];

export const CASCADING_FAILURES: CascadingRiskItem[] = [
  {
    id: 'casc-1',
    primaryAsset: 'Grid Substation North-Puri',
    primaryType: 'substation',
    statusBadge: 'TRIPPED',
    badgeColor: 'error',
    downstreamImpacts: [
      {
        target: 'Water Treatment Plant #2',
        statusText: 'Backup Generator Active',
        statusTone: 'amber'
      },
      {
        target: 'Puri General Hospital Grid',
        statusText: 'Tier-1 Failover Ready',
        statusTone: 'emerald'
      }
    ]
  },
  {
    id: 'casc-2',
    primaryAsset: 'Mahanadi Coastal Highway Bridge',
    primaryType: 'bridge',
    statusBadge: 'AT RISK',
    badgeColor: 'amber',
    downstreamImpacts: [
      {
        target: 'Evacuation Route Alpha',
        statusText: 'Imminent Closure',
        statusTone: 'amber'
      }
    ]
  },
  {
    id: 'casc-3',
    primaryAsset: 'Satapada-Chilika Causeway Link',
    primaryType: 'bridge',
    statusBadge: 'ISOLATED',
    badgeColor: 'error',
    downstreamImpacts: [
      {
        target: 'Chilika Shelter Cluster #3',
        statusText: 'Amphibious Access Only',
        statusTone: 'error'
      },
      {
        target: 'Cellular Tower B-44',
        statusText: 'Battery Depleted (T-12h)',
        statusTone: 'error'
      }
    ]
  }
];
