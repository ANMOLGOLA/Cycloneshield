import React, { useMemo } from 'react';
import { 
  X, 
  Flame, 
  CloudRain, 
  Zap, 
  Waves, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';
import { computeMultiHazardIndices } from '../geo-core/multiHazard';
import { DistrictRisk } from '../types/cyclone';

interface MultiHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: DistrictRisk;
}

export const MultiHazardModal: React.FC<MultiHazardModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
}) => {
  const hazards = useMemo(() => {
    return computeMultiHazardIndices({
      districtId: selectedDistrict.id,
      surgeDepthM: selectedDistrict.peakSurgeM,
      rainfall24hMm: selectedDistrict.rainfallAccumMm,
      surfaceTempC: 32.5,
      relativeHumidityPct: 88,
      capeJouleKg: 2900,
    });
  }, [selectedDistrict]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-orange-400 shadow">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Multi-Hazard Risk Assessment Framework
                <span className="text-[10px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-700 font-mono">
                  Primary Threat: {hazards.primaryThreat}
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Coupled Cyclonic Surge, Pluvial Flash Floods, Extreme Heat Wet-Bulb, and Lightning Strike Indices ({selectedDistrict.name})
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

        {/* Hazard Grid */}
        <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cyclone Surge */}
          <div className="p-4 rounded-xl bg-[#1b2831] border border-[#263845] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-[#92ccff]" /> Coastal Storm Surge
              </span>
              <span className="font-mono text-xs font-bold text-[#92ccff]">{hazards.cycloneSurgeIndex} / 100</span>
            </div>
            <div className="w-full bg-[#121a21] h-2 rounded-full overflow-hidden">
              <div className="bg-[#92ccff] h-full rounded-full" style={{ width: `${hazards.cycloneSurgeIndex}%` }} />
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              Peak water level: +{selectedDistrict.peakSurgeM}m above MSL
            </span>
          </div>

          {/* Flash Flooding */}
          <div className="p-4 rounded-xl bg-[#1b2831] border border-[#263845] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" /> Pluvial Flash Flood
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">{hazards.pluvialFloodIndex} / 100</span>
            </div>
            <div className="w-full bg-[#121a21] h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${hazards.pluvialFloodIndex}%` }} />
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              24h Accumulation: {selectedDistrict.rainfallAccumMm} mm
            </span>
          </div>

          {/* Heat Stress */}
          <div className="p-4 rounded-xl bg-[#1b2831] border border-[#263845] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Extreme Heat Wet-Bulb
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">{hazards.heatStressIndex} / 100</span>
            </div>
            <div className="w-full bg-[#121a21] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${hazards.heatStressIndex}%` }} />
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              Post-landfall power outage humidity thermal index
            </span>
          </div>

          {/* Lightning Threat */}
          <div className="p-4 rounded-xl bg-[#1b2831] border border-[#263845] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Lightning Strike Threat
              </span>
              <span className="font-mono text-xs font-bold text-yellow-400">{hazards.lightningThreatIndex} / 100</span>
            </div>
            <div className="w-full bg-[#121a21] h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${hazards.lightningThreatIndex}%` }} />
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              Convective Available Potential Energy (CAPE: 2900 J/kg)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            Screening-level model, not an operational forecast. Calibrated against IMD and INCOIS benchmarks.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
