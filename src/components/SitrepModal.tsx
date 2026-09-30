import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Shield 
} from 'lucide-react';
import { DistrictRisk, CycloneEvent, CriticalAsset, CascadingRiskItem } from '../types/cyclone';

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  cyclone: CycloneEvent;
  selectedDistrict: DistrictRisk;
  districts: DistrictRisk[];
  cascadingFailures: CascadingRiskItem[];
}

export const SitrepModal: React.FC<SitrepModalProps> = ({
  isOpen,
  onClose,
  cyclone,
  selectedDistrict,
  districts,
  cascadingFailures,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sitrepContent = `================================================================================
CYCLONESHIELD OPERATIONAL SITUATION REPORT (SITREP #04)
ISSUED BY: NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA) / RSMC NEW DELHI
DATE/TIME: 28 OCT 2026, 14:00 UTC (T-18H PRE-LANDFALL WINDOW)
SECURITY CLASSIFICATION: OFFICIAL USE ONLY // CIVIL DEFENSE ACTIONABLE
================================================================================

1. HYDRO-METEOROLOGICAL TELEMETRY
- Storm Identifier: ${cyclone.name} (${cyclone.category})
- Current Position: 19.1°N, 85.3°E (Westcentral Bay of Bengal)
- Central Pressure: ${cyclone.centralPressureHpa} hPa (Pressure Deficit: 72 hPa)
- Maximum Sustained Wind: ${cyclone.windSpeedKt} kt (250 km/h) gusting to 150 kt
- Movement: ${cyclone.movement}
- Estimated Landfall: ${cyclone.landfallEta} near ${cyclone.landfallLocation}

2. STORM SURGE & INUNDATION PROFILE (BATHTUB + DEM MODELING)
- Maximum Total Water Level: +${selectedDistrict.peakSurgeM} m above astronomical tide in ${selectedDistrict.name}
- Inundation Footprint: ${selectedDistrict.demInundationAreaKm2} km² coastal floodplain
- Peak Astronomical Tide Phase: Mean High Water (+1.25m)
- Significant Wave Height (Hs): 10.4m observed at NIOT Buoy BD-11

3. EVACUATION & HUMANITARIAN SUMMARY
- Total Population at Risk: ${(districts.slice(0, 5).reduce((a, b) => a + b.populationMillions, 0)).toFixed(1)} Million
- Total Evacuated: 342,120 persons (+14% ahead of schedule)
- Multipurpose Shelters Operational: 894 / 920 active (97% capacity)
- NDRF Deployment: 44 Task Force Battalions staged in Puri, Khordha, Ganjam

4. CRITICAL INFRASTRUCTURE & CASCADING FAILURES
${cascadingFailures.map((item, idx) => `[FAILURE ${idx + 1}] ${item.primaryAsset} (${item.statusBadge})
  -> Downstream impacts: ${item.downstreamImpacts.map(d => `${d.target} [${d.statusText}]`).join(', ')}`).join('\n')}

5. PARAMETRIC INSURANCE LIQUIDITY STATUS
- Regional Liquidity Facility: $50,000,000 USD
- Trigger Met for Puri District: $14,500,000 USD authorized for instant disbursement

================================================================================
DISTRIBUTION: NDMA EOC, CHIEF SECRETARY ODISHA, HQ INTEGRATED DEFENSE STAFF, IMD
================================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sitrepContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff]">
              <FileText className="w-4 h-4 text-[#92ccff]" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Operational Situation Report (SITREP)
                <span className="text-[10px] bg-[#1b2831] text-[#92ccff] px-2 py-0.5 rounded border border-[#364f63] font-mono">
                  SITREP #04
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Standard Military / Civil Defense Inter-Agency Incident Briefing
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg bg-[#1b2831] hover:bg-[#263845] text-[#8a919b] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sitrep Document Text Box */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#0b1220]">
          <pre className="font-mono text-xs text-[#dce2f6] leading-relaxed whitespace-pre-wrap select-text p-4 bg-[#121a21] rounded-lg border border-[#263845]">
            {sitrepContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded text-white border border-[#364f63] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded text-white border border-[#364f63] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#92ccff]" />
              <span>Print Ready</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
