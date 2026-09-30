import React, { useState } from 'react';
import { 
  DollarSign, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  FileCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { DistrictRisk, CycloneEvent } from '../types/cyclone';

interface ParametricInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: DistrictRisk[];
  cyclone: CycloneEvent;
}

export const ParametricInsuranceModal: React.FC<ParametricInsuranceModalProps> = ({
  isOpen,
  onClose,
  districts,
  cyclone,
}) => {
  const [activeTab, setActiveTab] = useState<'triggers' | 'pool' | 'settlement'>('triggers');
  const [claimedDistricts, setClaimedDistricts] = useState<string[]>(['puri']);
  const [processingDistrict, setProcessingDistrict] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate total eligible rapid liquidity
  const totalEligible = districts.reduce((acc, d) => {
    return acc + (d.parametricPayoutReadiness === 'TRIGGERED' ? d.parametricPayoutAmountUsd : 0);
  }, 0);

  const handleExecutePayout = async (districtId: string) => {
    setProcessingDistrict(districtId);
    try {
      const d = districts.find((item) => item.id === districtId);
      const res = await fetch('/api/insurance/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId,
          triggerWindKt: 120,
          triggerSurgeM: 2.5,
          observedWindKt: d?.peakWindKt || cyclone.windSpeedKt,
          observedSurgeM: d?.peakSurgeM || 4.8,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimedDistricts((prev) => [...prev, districtId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingDistrict(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Parametric Disaster Insurance &amp; Rapid Liquidity Facility
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  Oracle Grounded
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Pre-agreed indemnity triggers evaluated against IMD AWS and NIOT Deep-Sea Buoys
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

        {/* Facility Overview Banner */}
        <div className="bg-[#19202e] border-b border-[#2e3544] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-[#8a919b] uppercase block">Regional Liquidity Pool</span>
              <span className="font-mono text-base font-bold text-white">$50,000,000 USD</span>
            </div>
            <div className="border-l border-[#2e3544] pl-6">
              <span className="text-[10px] text-[#8a919b] uppercase block">Pre-Triggered Liquidity</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                ${(totalEligible / 1e6).toFixed(1)}M USD
              </span>
            </div>
            <div className="border-l border-[#2e3544] pl-6">
              <span className="text-[10px] text-[#8a919b] uppercase block">Disbursement Window</span>
              <span className="font-mono text-xs text-white">Within 24 Hours of Landfall</span>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
            District Policy Triggers &amp; Payout Readiness
          </span>

          <div className="border border-[#263845] rounded-xl overflow-hidden bg-[#1b2831]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151b2a] text-[#8a919b] font-mono text-[11px] uppercase border-b border-[#263845]">
                <tr>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Trigger Rule</th>
                  <th className="py-2.5 px-3">Observed Telemetry</th>
                  <th className="py-2.5 px-3">Estimated Payout</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263845]">
                {districts.slice(0, 6).map((d) => {
                  const isClaimed = claimedDistricts.includes(d.id);
                  const isTriggered = d.parametricPayoutReadiness === 'TRIGGERED';
                  const isEligible = d.parametricPayoutReadiness === 'ELIGIBLE_SOON';

                  return (
                    <tr key={d.id} className="hover:bg-[#232a39] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{d.name}</span>
                        <span className="text-[10px] text-[#8a919b]">{d.state} · Pop: {d.populationMillions}M</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[#c0c7d1]">
                        Wind &gt; 120 kt OR Surge &gt; 2.5m
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="text-white">{d.peakWindKt} kt</span> / <span className="text-amber-400">+{d.peakSurgeM}m</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-sm font-bold text-emerald-400">
                        ${(d.parametricPayoutAmountUsd / 1e6).toFixed(1)}M
                      </td>

                      <td className="py-3 px-3">
                        {isClaimed ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> DISBURSED
                          </span>
                        ) : isTriggered ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#ffb4ab] bg-[#93000a]/30 px-2 py-0.5 rounded border border-[#ffb4ab]/30">
                            TRIGGER MET
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            ELIGIBLE T-6H
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#8a919b] bg-[#121a21] px-2 py-0.5 rounded">
                            MONITORING
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isClaimed ? (
                          <span className="text-[10px] text-[#8a919b] font-mono">Disbursed</span>
                        ) : (
                          <button
                            onClick={() => handleExecutePayout(d.id)}
                            disabled={processingDistrict === d.id}
                            className="px-2.5 py-1 bg-[#263845] hover:bg-[#364f63] text-[#92ccff] rounded text-[11px] font-bold transition-colors disabled:opacity-50"
                          >
                            {processingDistrict === d.id ? 'Verifying...' : 'Authorize Payout'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-[#121a21] p-3 rounded-lg border border-[#263845] text-[11px] text-[#8a919b] leading-relaxed">
            <span className="font-bold text-white block mb-0.5">Parametric Liquidity Architecture:</span>
            Unlike traditional claims requiring months of post-disaster loss adjustment, parametric payouts disburse zero-loss-adjustment cash within 24 hours of sensor trigger confirmation directly to district emergency relief bank accounts.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
