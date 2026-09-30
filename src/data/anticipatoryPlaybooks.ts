export interface ActionItem {
  id: string;
  phase: 'T-72h' | 'T-48h' | 'T-24h' | 'T-12h' | 'Landfall' | 'Post-Landfall';
  title: string;
  description: string;
  assignedRole: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  triggerCondition: string;
  isAutomatedTrigger: boolean;
}

export interface AnticipatoryPlaybook {
  districtId: string;
  districtName: string;
  currentPhase: string;
  leadTimeHours: number;
  readinessScorePct: number;
  actions: ActionItem[];
}

export const DISTRICT_PLAYBOOKS: Record<string, AnticipatoryPlaybook> = {
  puri: {
    districtId: 'puri',
    districtName: 'Puri District',
    currentPhase: 'T-18h (Pre-Landfall Peak)',
    leadTimeHours: 18,
    readinessScorePct: 88,
    actions: [
      {
        id: 'PURI-72-01',
        phase: 'T-72h',
        title: 'Pre-position NDRF & ODRAF Boat Units',
        description: 'Deploy 6 NDRF battalions and 12 inflatable rescue boats to Astaranga, Kakatpur, and Brahmagiri blocks.',
        assignedRole: 'District Collector & NDRF Commander',
        status: 'COMPLETED',
        triggerCondition: 'Cyclone enters Bay of Bengal 72h cone with sustained winds > 65 kt',
        isAutomatedTrigger: true,
      },
      {
        id: 'PURI-48-01',
        phase: 'T-48h',
        title: 'Port Closure & Fishing Fleet Recall',
        description: 'Enforce Section 144 along 140 km coastal tract; recall 1,420 registered mechanized fishing trawlers.',
        assignedRole: 'Port Officer & Coastal Police',
        status: 'COMPLETED',
        triggerCondition: 'Wave height forecast Hs > 4.0 m from INCOIS BD-11 buoy',
        isAutomatedTrigger: true,
      },
      {
        id: 'PURI-24-01',
        phase: 'T-24h',
        title: 'Mass Evacuation of Coastal Tract (< 5 km)',
        description: 'Evacuate 342,000 vulnerable citizens to 920 Multipurpose Cyclone Shelters with 7-day ration packs.',
        assignedRole: 'Sub-Collector & Tehsildar Relief Squads',
        status: 'IN_PROGRESS',
        triggerCondition: 'Composite Risk Score > 78 and Surge Peak > 3.0 m',
        isAutomatedTrigger: true,
      },
      {
        id: 'PURI-12-01',
        phase: 'T-12h',
        title: 'Defensive Power Grid Cutoff',
        description: 'De-energize 220kV/33kV transmission lines across low-lying estuaries to prevent transformer explosions and electrocution.',
        assignedRole: 'OPTCL Chief Grid Controller',
        status: 'PENDING',
        triggerCondition: 'Holland wind speed threshold > 60 kt sustained at substation coordinates',
        isAutomatedTrigger: true,
      },
      {
        id: 'PURI-00-01',
        phase: 'Landfall',
        title: 'Hospital Microgrid & Generator Safeguard',
        description: 'Lock in dual 500kVA backup diesel gensets at Puri General Hospital; secure 42h bunker fuel reservoir.',
        assignedRole: 'Chief Medical Officer & Hospital Engineering',
        status: 'PENDING',
        triggerCondition: 'Landfall ETA = 0h',
        isAutomatedTrigger: true,
      },
    ],
  },
};
