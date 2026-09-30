export interface VulnerableDemographics {
  districtId: string;
  districtName: string;
  totalVulnerablePopulation: number;
  elderlyCount: number; // Age > 65
  disabledCount: number;
  fisherfolkCount: number;
  priorityShelterRoutes: string[];
  privacyProtectionStatus: 'DPDP_ACT_2023_COMPLIANT' | 'PSEUDONYMIZED';
  specialEvacuationAssistanceNeeded: number;
}

export const VULNERABLE_DEMOGRAPHICS: Record<string, VulnerableDemographics> = {
  puri: {
    districtId: 'puri',
    districtName: 'Puri District',
    totalVulnerablePopulation: 58400,
    elderlyCount: 28200,
    disabledCount: 6400,
    fisherfolkCount: 23800,
    priorityShelterRoutes: [
      'Route Alpha: Astaranga Coastal Corridor -> MCS #12',
      'Route Bravo: Brahmagiri Lowland -> Gop Multi-Tier Shelter',
      'Route Charlie: Swargadwar -> Town High School Shelter',
    ],
    privacyProtectionStatus: 'DPDP_ACT_2023_COMPLIANT',
    specialEvacuationAssistanceNeeded: 4820,
  },
  ganjam: {
    districtId: 'ganjam',
    districtName: 'Ganjam District',
    totalVulnerablePopulation: 72100,
    elderlyCount: 34100,
    disabledCount: 8200,
    fisherfolkCount: 29800,
    priorityShelterRoutes: [
      'Gopalpur Seacoast Corridor -> MCS #04',
      'Chhatrapur Estuary Road -> Chhatrapur College Shelter',
    ],
    privacyProtectionStatus: 'DPDP_ACT_2023_COMPLIANT',
    specialEvacuationAssistanceNeeded: 5900,
  },
};
