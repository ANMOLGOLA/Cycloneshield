import React, { useState } from 'react';
import { 
  Zap, 
  Share2, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Users, 
  Home, 
  ShieldAlert, 
  Download, 
  Send, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { DistrictRisk, CriticalAsset, CascadingRiskItem } from '../types/cyclone';

interface InspectorPanelProps {
  selectedDistrict: DistrictRisk;
  activeSectorMetrics: {
    evacuated: string;
    evacuatedDelta: string;
    sheltersActive: string;
    shelterPct: string;
  };
  cascadingFailures: CascadingRiskItem[];
  criticalAssets: CriticalAsset[];
  onBroadcastEvacuation: () => void;
  onExportSitrep: () => void;
  onDispatchNdrf: () => void;
  onOpenGeminiAI: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedDistrict,
  activeSectorMetrics,
  cascadingFailures,
  criticalAssets,
  onBroadcastEvacuation,
  onExportSitrep,
  onDispatchNdrf,
  onOpenGeminiAI,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'risk' | 'impact' | 'actions'>('summary');
  const [ndrfDispatched, setNdrfDispatched] = useState(false);

  // Filter assets for current district
  const districtAssets = criticalAssets.filter((a) => a.districtId === selectedDistrict.id);

  return (
    <aside className="w-96 bg-[#121a21] border-l border-[#263845] flex flex-col z-10 select-none">
      {/* Inspector Tabs */}
      <div className="flex border-b border-[#263845] bg-[#151b2a]">
        {(['summary', 'risk', 'impact', 'actions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs capitalize transition-colors ${
              activeTab === tab
                ? 'font-bold text-[#92ccff] border-b-2 border-[#92ccff] bg-[#121a21]'
                : 'font-medium text-[#8a919b] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inspector Content Body */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
        {activeTab === 'summary' && (
          <>
            {/* Live Metrics Card */}
            <div className="bg-[#1b2831] rounded-xl p-3.5 border border-[#364f63] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Active Sector Metrics
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Nominal Ops
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#121a21] p-2.5 rounded-lg border border-[#263845]">
                  <span className="text-[10px] text-[#8a919b] uppercase block">
                    Evacuated
                  </span>
                  <span className="font-mono text-lg font-bold text-white">
                    {activeSectorMetrics.evacuated}
                  </span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    {activeSectorMetrics.evacuatedDelta}
                  </span>
                </div>
                <div className="bg-[#121a21] p-2.5 rounded-lg border border-[#263845]">
                  <span className="text-[10px] text-[#8a919b] uppercase block">
                    Shelters Active
                  </span>
                  <span className="font-mono text-lg font-bold text-white">
                    {activeSectorMetrics.sheltersActive}
                  </span>
                  <span className="text-[10px] text-[#8a919b] block font-mono">
                    {activeSectorMetrics.shelterPct}
                  </span>
                </div>
              </div>
            </div>

            {/* Cascading Dependency Trees */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
                  Infrastructure Cascading Risks
                </span>
                <span className="text-[10px] bg-[#93000a]/30 text-[#ffb4ab] px-2 py-0.5 rounded font-mono font-bold border border-[#ffb4ab]/30">
                  {cascadingFailures.length} Failures
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {cascadingFailures.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-[#1b2831] p-3 rounded-xl border flex flex-col gap-2 ${
                      item.statusBadge === 'TRIPPED'
                        ? 'border-[#ffb4ab]/30'
                        : 'border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.primaryType === 'substation' ? (
                          <Zap className="w-4 h-4 text-[#ffb4ab]" />
                        ) : (
                          <Share2 className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-xs font-bold text-white">
                          {item.primaryAsset}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.statusBadge === 'TRIPPED'
                            ? 'bg-[#ffb4ab] text-[#690005]'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.statusBadge}
                      </span>
                    </div>

                    {/* Downstream branches */}
                    <div className="pl-4 ml-1.5 border-l-2 border-[#364f63] flex flex-col gap-1.5">
                      {item.downstreamImpacts.map((down, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-[#c0c7d1] text-[11px] truncate pr-2">
                            {down.target}
                          </span>
                          <span
                            className={`font-mono text-[10px] whitespace-nowrap ${
                              down.statusTone === 'emerald'
                                ? 'text-emerald-400'
                                : down.statusTone === 'error'
                                ? 'text-[#ffb4ab]'
                                : 'text-amber-400'
                            }`}
                          >
                            {down.statusText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick District Focus */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#92ccff]" /> {selectedDistrict.name} District Focus
                </span>
                <span className="text-[10px] font-mono text-[#92ccff] bg-[#263845] px-1.5 py-0.5 rounded">
                  Score: {selectedDistrict.overallScore}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#c0c7d1]">
                <div>Peak Surge: <span className="font-mono text-amber-400 font-bold">+{selectedDistrict.peakSurgeM}m</span></div>
                <div>Peak Wind: <span className="font-mono text-white">{selectedDistrict.peakWindKt} kt</span></div>
                <div>Pop At Risk: <span className="font-mono text-white">{selectedDistrict.populationMillions}M</span></div>
                <div>Inundation: <span className="font-mono text-white">{selectedDistrict.demInundationAreaKm2} km²</span></div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'risk' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63]">
              <div className="font-bold text-white mb-1">Explainable Risk Formula</div>
              <div className="font-mono text-[11px] text-[#92ccff] bg-[#121a21] p-2 rounded border border-[#263845]">
                Risk = (Hazard × 0.45) + (Exposure × 0.35) + (Vulnerability × 0.20)
              </div>
              <div className="mt-3 flex flex-col gap-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-[#c0c7d1]">
                    <span>Hazard (Surge &amp; Wind):</span>
                    <span className="font-mono text-white">{selectedDistrict.hazardScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#121a21] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#ffb4ab] h-full" style={{ width: `${selectedDistrict.hazardScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#c0c7d1]">
                    <span>Exposure (Assets &amp; Pop):</span>
                    <span className="font-mono text-white">{selectedDistrict.exposureScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#121a21] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-amber-400 h-full" style={{ width: `${selectedDistrict.exposureScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#c0c7d1]">
                    <span>Vulnerability (Socio-economic):</span>
                    <span className="font-mono text-white">{selectedDistrict.vulnerabilityScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#121a21] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#92ccff] h-full" style={{ width: `${selectedDistrict.vulnerabilityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63] flex flex-col gap-2">
              <span className="font-bold text-white">Parametric Insurance Status</span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#c0c7d1]">Pre-Trigger State:</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  {selectedDistrict.parametricPayoutReadiness}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#c0c7d1]">Estimated Rapid Liquidity:</span>
                <span className="font-mono font-bold text-white">
                  ${(selectedDistrict.parametricPayoutAmountUsd / 1e6).toFixed(1)}M USD
                </span>
              </div>
              <p className="text-[10px] text-[#8a919b]">
                Funds pre-authorized for immediate release to district disaster relief treasury within 24 hours of landfall verification.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63]">
              <span className="font-bold text-white block mb-2">Shelter Capacity Catchment</span>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#c0c7d1]">Occupancy:</span>
                <span className="font-mono text-white font-bold">{selectedDistrict.shelterCapacityUsedPct}%</span>
              </div>
              <div className="w-full bg-[#121a21] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedDistrict.shelterCapacityUsedPct > 90 ? 'bg-[#ffb4ab]' : 'bg-emerald-400'}`}
                  style={{ width: `${selectedDistrict.shelterCapacityUsedPct}%` }}
                />
              </div>
              <div className="mt-2 text-[10px] text-[#8a919b] flex justify-between">
                <span>{selectedDistrict.sheltersActive} Operational</span>
                <span>{selectedDistrict.sheltersTotal} Designated Total</span>
              </div>
            </div>

            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63]">
              <span className="font-bold text-white block mb-2">Critical Facilities in {selectedDistrict.name}</span>
              <div className="flex flex-col gap-2">
                {districtAssets.length === 0 ? (
                  <span className="text-[11px] text-[#8a919b]">No flagged assets in this district.</span>
                ) : (
                  districtAssets.map((asset) => (
                    <div key={asset.id} className="p-2 bg-[#121a21] rounded border border-[#263845] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white text-[11px]">{asset.name}</div>
                        <div className="text-[9px] text-[#8a919b] uppercase">{asset.type} · Elev: {asset.elevationM}m</div>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        asset.status === 'tripped' || asset.status === 'flooded' ? 'bg-[#ffb4ab] text-[#690005]' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63]">
              <span className="font-bold text-white block mb-1">Standard Operating Procedures</span>
              <p className="text-[11px] text-[#c0c7d1] leading-relaxed">
                Prior to T-12h landfall window, mandatory evacuation orders must be dispatched across local dialects (Odia, Bengali, Hindi). Critical arterial bridges must be closed to two-wheelers and high-profile freight.
              </p>
            </div>

            <button
              onClick={onOpenGeminiAI}
              className="p-3 rounded-xl bg-gradient-to-r from-[#19202e] to-[#263845] border border-[#364f63] text-left hover:border-[#92ccff] transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#92ccff]" /> Query Geospatial Intelligence
                </div>
                <div className="text-[10px] text-[#8a919b] mt-0.5">
                  Ask questions like "Which road to Puri hospital is flooded?"
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#92ccff]" />
            </button>
          </div>
        )}

        {/* Quick Actions / Bottom Emergency Commands (Always pinned at bottom) */}
        <div className="flex flex-col gap-2.5 mt-auto pt-3 border-t border-[#263845]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a919b]">
            Emergency Commands
          </span>

          {/* Broadcast Mandatory Evacuation */}
          <button
            onClick={onBroadcastEvacuation}
            className="w-full bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-[0.99]"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Broadcast Mandatory Evacuation</span>
          </button>

          {/* Export SITREP and Dispatch NDRF */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportSitrep}
              className="bg-[#1b2831] hover:bg-[#263845] text-white text-xs font-semibold py-2 px-3 rounded-xl border border-[#364f63] transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#92ccff]" />
              <span>Export SITREP</span>
            </button>

            <button
              onClick={() => {
                setNdrfDispatched(true);
                onDispatchNdrf();
              }}
              className={`text-xs font-semibold py-2 px-3 rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                ndrfDispatched
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#1b2831] hover:bg-[#263845] text-white border-[#364f63]'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${ndrfDispatched ? 'text-emerald-400' : 'text-[#92ccff]'}`} />
              <span>{ndrfDispatched ? 'NDRF Deployed' : 'Dispatch NDRF'}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
