import React from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Lock, 
  HeartHandshake, 
  MapPin, 
  Navigation, 
  UserCheck 
} from 'lucide-react';
import { VULNERABLE_DEMOGRAPHICS, VulnerableDemographics } from '../data/vulnerablePopulation';
import { DistrictRisk } from '../types/cyclone';

interface VulnerablePopulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: DistrictRisk;
}

export const VulnerablePopulationModal: React.FC<VulnerablePopulationModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
}) => {
  const demographics =
    VULNERABLE_DEMOGRAPHICS[selectedDistrict.id.toLowerCase()] || VULNERABLE_DEMOGRAPHICS['puri'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-purple-400 shadow">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Vulnerable Populations &amp; Special Assistance Layer
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-700 font-mono">
                  India DPDP Act 2023 Compliant
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Privacy-protected targeting for elderly, disabled, and coastal fisher communities ({selectedDistrict.name})
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

        {/* Hero Demographic Stats */}
        <div className="px-5 py-4 bg-[#0f171e] border-b border-[#263845] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-[#1b2831] p-3 rounded-lg border border-[#263845]">
            <span className="text-[10px] text-[#8a919b] uppercase block">Total Vulnerable:</span>
            <span className="text-xl font-bold text-white">{demographics.totalVulnerablePopulation.toLocaleString()}</span>
          </div>

          <div className="bg-[#1b2831] p-3 rounded-lg border border-purple-500/30">
            <span className="text-[10px] text-purple-400 uppercase block">Elderly (&gt;65y):</span>
            <span className="text-xl font-bold text-purple-300">{demographics.elderlyCount.toLocaleString()}</span>
          </div>

          <div className="bg-[#1b2831] p-3 rounded-lg border border-purple-500/30">
            <span className="text-[10px] text-purple-400 uppercase block">Disabled Citizens:</span>
            <span className="text-xl font-bold text-purple-300">{demographics.disabledCount.toLocaleString()}</span>
          </div>

          <div className="bg-[#1b2831] p-3 rounded-lg border border-amber-500/30">
            <span className="text-[10px] text-amber-400 uppercase block">Fisherfolk Families:</span>
            <span className="text-xl font-bold text-amber-300">{demographics.fisherfolkCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Priority Routes */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#92ccff]" /> Assisted Evacuation Corridors &amp; Safe Routing:
            </span>

            <div className="flex flex-col gap-2">
              {demographics.priorityShelterRoutes.map((route, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#1b2831] border border-[#263845] text-xs text-[#c0c7d1] font-mono flex items-center gap-2">
                  <span className="size-5 rounded-full bg-[#121a21] border border-[#364f63] text-purple-300 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {route}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="bg-[#121a21] p-3.5 rounded-xl border border-[#263845] text-[11px] text-[#8a919b] leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-white block mb-0.5">Privacy &amp; Data Minimization Notice:</strong>
              Under India's Digital Personal Data Protection (DPDP) Act 2023, individual names and exact residential coordinates are pseudonymized. Aggregated block-level counts are delivered only to verified rescue coordinators.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            Special rescue ambulance squads assigned to priority routes.
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
