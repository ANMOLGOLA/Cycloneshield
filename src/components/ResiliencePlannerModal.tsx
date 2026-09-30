import React, { useState } from 'react';
import { 
  X, 
  Building, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Coins 
} from 'lucide-react';
import { RESILIENCE_PROJECTS, InfrastructureProject } from '../data/resiliencePlanner';

interface ResiliencePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResiliencePlannerModal: React.FC<ResiliencePlannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [projects, setProjects] = useState<InfrastructureProject[]>(RESILIENCE_PROJECTS);

  if (!isOpen) return null;

  const toggleProjectHardening = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hardenedStatus: !p.hardenedStatus } : p))
    );
  };

  const fundedProjects = projects.filter((p) => p.hardenedStatus);
  const totalCostCr = fundedProjects.reduce((acc, p) => acc + p.costInrCrores, 0);
  const totalAvoidedLossCr = fundedProjects.reduce((acc, p) => acc + p.expectedLossAvoidanceInrCrores, 0);
  const overallBcr = totalCostCr > 0 ? (totalAvoidedLossCr / totalCostCr).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-cyan-400 shadow">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Resilience Investment Planner (Cost-Benefit Ranking)
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-mono">
                  Avoided Loss Engine
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Quantified avoided direct &amp; cascading losses (₹ Crores) per Rupee of infrastructure adaptation investment
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

        {/* Investment Impact Hero Bar */}
        <div className="px-5 py-3.5 bg-[#0f171e] border-b border-[#263845] grid grid-cols-3 gap-3">
          <div className="bg-[#1b2831] p-3 rounded-lg border border-[#263845]">
            <span className="text-[10px] font-bold uppercase text-[#8a919b] block">Allocated Capex:</span>
            <span className="font-mono text-xl font-bold text-white">₹{totalCostCr.toFixed(1)} Cr</span>
          </div>

          <div className="bg-[#1b2831] p-3 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">Expected Loss Avoidance:</span>
            <span className="font-mono text-xl font-bold text-emerald-300">₹{totalAvoidedLossCr.toFixed(1)} Cr</span>
          </div>

          <div className="bg-[#1b2831] p-3 rounded-lg border border-cyan-500/30">
            <span className="text-[10px] font-bold uppercase text-cyan-400 block">Portfolio Benefit-Cost Ratio:</span>
            <span className="font-mono text-xl font-bold text-cyan-300">{overallBcr}x Return</span>
          </div>
        </div>

        {/* Projects Table */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3">
          {projects.map((proj, idx) => {
            return (
              <div
                key={proj.id}
                onClick={() => toggleProjectHardening(proj.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  proj.hardenedStatus
                    ? 'bg-[#15272a] border-cyan-500/50 shadow'
                    : 'bg-[#1b2831] border-[#263845] hover:border-[#364f63]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-6 rounded-lg border flex items-center justify-center mt-0.5 transition-colors ${
                      proj.hardenedStatus
                        ? 'bg-cyan-500 text-[#002830] border-cyan-400 font-bold'
                        : 'bg-[#121a21] border-[#364f63] text-transparent hover:text-[#8a919b]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121a21] text-cyan-300 border border-[#263845] font-bold">
                        Rank #{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-[#8a919b]">
                      <span>Cost: <strong className="text-white">₹{proj.costInrCrores} Cr</strong></span>
                      <span>Avoided Loss: <strong className="text-emerald-400">₹{proj.expectedLossAvoidanceInrCrores} Cr</strong></span>
                      <span>Risk Cut: <strong className="text-cyan-300">-{proj.riskReductionPct}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono">
                  <span className="text-sm font-bold text-amber-400 bg-[#121a21] px-2.5 py-1 rounded border border-amber-500/30">
                    {proj.benefitCostRatio}x BCR
                  </span>
                  <span className="text-[10px] text-[#8a919b]">
                    {proj.hardenedStatus ? 'Funded & Active' : 'Click to Fund'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            Rankings calibrated with historical damage telemetry from Super Cyclone Amphan and Fani.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors shadow"
          >
            Apply Investment Profile
          </button>
        </div>
      </div>
    </div>
  );
};
