import React from 'react';
import { 
  Shield, 
  Map, 
  Wind, 
  Waves, 
  Sparkles, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText, 
  ArrowRight, 
  Radio, 
  Gauge, 
  History,
  Lock,
  ChevronRight
} from 'lucide-react';
import { CycloneEvent, DistrictRisk, CriticalAsset } from '../types/cyclone';
import { GlobalAlertTicker, RedAlertItem } from './GlobalAlertTicker';

interface HomePageProps {
  cyclone: CycloneEvent;
  cycloneList: CycloneEvent[];
  onSelectCyclone: (c: CycloneEvent) => void;
  districts: DistrictRisk[];
  criticalAssets?: CriticalAsset[];
  onEnterCommandCenter: () => void;
  onOpenEvacuationModal: () => void;
  onOpenScenarioLab: () => void;
  onOpenGeminiAI: () => void;
  onOpenParametric: () => void;
  onOpenTelemetry: () => void;
  onOpenSitrep: () => void;
  onOpenRiskModel: () => void;
  onSelectDistrict?: (d: DistrictRisk) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  cyclone,
  cycloneList,
  onSelectCyclone,
  districts,
  criticalAssets,
  onEnterCommandCenter,
  onOpenEvacuationModal,
  onOpenScenarioLab,
  onOpenGeminiAI,
  onOpenParametric,
  onOpenTelemetry,
  onOpenSitrep,
  onOpenRiskModel,
  onSelectDistrict,
}) => {
  // Top 5 priority districts
  const topDistricts = [...districts].sort((a, b) => a.rank - b.rank).slice(0, 5);

  const handleTickerAction = (alert: RedAlertItem) => {
    if (alert.actionType === 'evacuate') {
      onOpenEvacuationModal();
    } else if (alert.actionType === 'insurance') {
      onOpenParametric();
    } else {
      const match = districts.find(
        (d) => d.name.toLowerCase() === alert.districtName.toLowerCase() || d.id === alert.districtName.toLowerCase()
      );
      if (match && onSelectDistrict) {
        onSelectDistrict(match);
      }
      onEnterCommandCenter();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b1220] text-[#dce2f6] flex flex-col select-none">
      {/* 1. Persistent Global Alert Ticker (Aggregating all 'Red' Status Alerts) */}
      <GlobalAlertTicker
        districts={districts}
        cyclone={cyclone}
        criticalAssets={criticalAssets}
        onTakeAction={handleTickerAction}
        onInspectDistrict={(d) => {
          if (onSelectDistrict) onSelectDistrict(d);
          onEnterCommandCenter();
        }}
      />

      <div className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Top Operational Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#121a21] border border-[#263845] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-[#92ccff] uppercase">
                Active Operational Watch // Bay of Bengal Basin
              </span>
              <div className="text-sm font-semibold text-white">
                Tracking: <span className="text-[#ffb4ab] font-bold">{cyclone.name}</span> ({cyclone.category}) · Landfall ETA: {cyclone.landfallEta}
              </div>
            </div>
          </div>

          {/* Quick Storm Replay Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[11px] text-[#8a919b] font-mono mr-1">Storm:</span>
            {cycloneList.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCyclone(c)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap font-mono ${
                  c.id === cyclone.id
                    ? 'bg-[#92ccff] text-[#003351] font-bold shadow'
                    : 'bg-[#1b2831] text-[#c0c7d1] hover:text-white border border-[#364f63]'
                }`}
              >
                {c.name.replace('CYCLONE ', '').replace('SUPER ', '')} ({c.year})
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 bg-gradient-to-br from-[#121a21] via-[#151f2b] to-[#0c1321] border border-[#263845] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#92ccff]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2831] border border-[#364f63] text-xs font-mono text-[#92ccff] w-fit">
              <Shield className="w-3.5 h-3.5 text-[#92ccff]" />
              <span>PRE-LANDFALL PREDICTIVE ACTION PLATFORM</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Shift Cyclone Response from Post-Disaster to <span className="text-[#92ccff]">Pre-Landfall Action</span>
            </h1>

            <p className="text-sm md:text-base text-[#c0c7d1] leading-relaxed">
              Real-time storm tracking, Holland (1980) wind profiles, Copernicus GLO-30 DEM surge bathtub simulation, cascading infrastructure dependency alerts, and instant parametric insurance liquidity for the Bay of Bengal.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onEnterCommandCenter}
                className="px-6 py-3 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all active:scale-[0.99]"
              >
                <Map className="w-4 h-4" />
                <span>Enter Tactical Command Center</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onOpenEvacuationModal}
                className="px-5 py-3 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold rounded-xl text-sm flex items-center gap-2 shadow transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Authorize Evacuation Order</span>
              </button>

              <button
                onClick={onOpenGeminiAI}
                className="px-4 py-3 bg-[#1b2831] hover:bg-[#263845] text-white border border-[#364f63] font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#92ccff]" />
                <span>Ask Gemini AI Copilot</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Vital Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-[#121a21] border border-[#263845] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs uppercase font-mono text-[#8a919b] flex items-center justify-between">
              <span>Sustained Wind Threat</span>
              <Wind className="w-4 h-4 text-[#ffb4ab]" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">{cyclone.windSpeedKt}</span>
              <span className="text-xs text-[#8a919b] font-mono">kt ({Math.round(cyclone.windSpeedKt * 1.852)} km/h)</span>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              Central Pressure: {cyclone.centralPressureHpa} hPa
            </span>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#121a21] border border-[#263845] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs uppercase font-mono text-[#8a919b] flex items-center justify-between">
              <span>Translational Speed</span>
              <Gauge className="w-4 h-4 text-[#92ccff]" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">22.4</span>
              <span className="text-xs text-[#92ccff] font-mono">km/h</span>
            </div>
            <span className="text-[11px] text-[#c0c7d1] font-mono">
              Heading: NNW @ 12 kt · {cyclone.coastDistanceKm} km to coast
            </span>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#121a21] border border-[#263845] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs uppercase font-mono text-[#8a919b] flex items-center justify-between">
              <span>Humanitarian Evacuees</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">342,120</span>
              <span className="text-xs text-emerald-400 font-mono">+14% vs target</span>
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              894 / 920 Active Shelters (97% capacity)
            </span>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#121a21] border border-[#263845] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs uppercase font-mono text-[#8a919b] flex items-center justify-between">
              <span>Parametric Liquidity</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-emerald-400">$14.5M</span>
              <span className="text-xs text-[#8a919b] font-mono">USD Triggered</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              Ready for immediate district disbursement
            </span>
          </div>
        </div>

        {/* 6 Core Functional Modules Launcher */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Core Action Modules</h2>
              <p className="text-xs text-[#8a919b]">Select a mission workspace to inspect or execute directives</p>
            </div>
            <button
              onClick={onEnterCommandCenter}
              className="text-xs text-[#92ccff] hover:underline flex items-center gap-1 font-semibold"
            >
              Open Full Tactical Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Tactical Command Center */}
            <div
              onClick={onEnterCommandCenter}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-[#92ccff] rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff] group-hover:scale-105 transition-transform">
                <Map className="w-5 h-5 text-[#92ccff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#92ccff] transition-colors">
                  Tactical GIS Command Center
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Full-bleed tactical map, Holland wind isotachs (34/50/64kt), uncertainty cone, cascading substation &amp; bridge cuts, and timeline scrubber (T-72h to T+24h).
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-[#92ccff]">
                <span>Launch Map Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Evacuation & CAP Dispatch */}
            <div
              onClick={onOpenEvacuationModal}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-[#ffb4ab] rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5 text-[#ffb4ab]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#ffb4ab] transition-colors">
                  Early-Warning CAP 1.2 Dispatch
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Duty officer authorization console. Formats Common Alerting Protocol XML and plain text with multi-channel dispatch (SMS, WhatsApp, sirens) and audit hash.
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-[#ffb4ab]">
                <span>Review &amp; Approve Advisory</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Storm Surge & Scenario Lab */}
            <div
              onClick={onOpenScenarioLab}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-amber-400 rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Waves className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Storm Surge &amp; Scenario Lab
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Interactive simulation with sliders for landfall shift (-60km to +60km), central pressure (900-990 hPa), and astronomical tide. Computes in under 100ms.
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-amber-400">
                <span>Simulate Scenarios</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Gemini Multimodal AI */}
            <div
              onClick={onOpenGeminiAI}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-[#92ccff] rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#92ccff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#92ccff] transition-colors">
                  Gemini Multimodal Reasoning
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Natural-language questions grounded in computed GIS tools, 6-language advisory generator (Odia, Bengali, Hindi, Telugu, Tamil), and SAR damage detection.
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-[#92ccff]">
                <span>Query AI Copilot</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Parametric Disaster Insurance */}
            <div
              onClick={onOpenParametric}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-emerald-400 rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Parametric Insurance Liquidity
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Automatic payout triggers verified against IMD AWS and marine buoys. Disburses emergency liquidity from $50M regional pool within 24h of landfall.
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-emerald-400">
                <span>View Payouts &amp; Oracles</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Telemetry & SITREP */}
            <div
              onClick={onOpenTelemetry}
              className="bg-[#121a21] hover:bg-[#18232d] border border-[#263845] hover:border-[#92ccff] rounded-xl p-5 cursor-pointer transition-all flex flex-col gap-3 group shadow"
            >
              <div className="size-10 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff] group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-[#92ccff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#92ccff] transition-colors">
                  Marine Buoys &amp; SITREP Reports
                </h3>
                <p className="text-xs text-[#8a919b] mt-1 leading-relaxed">
                  Real-time NIOT deep-sea buoys, coastal AWS barometers, acoustic tide gauges, and print-ready military-format situation reports.
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-[#92ccff]">
                <span>Inspect Sensor Network</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Coastal Districts Ranking Table */}
        <div className="bg-[#121a21] border border-[#263845] rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Top-5 Priority Districts Risk Ranking
              </h2>
              <span className="text-xs text-[#8a919b]">
                Auditable Score Formula: R = (Hazard × 0.45) + (Exposure × 0.35) + (Vulnerability × 0.20)
              </span>
            </div>
            <button
              onClick={onOpenRiskModel}
              className="text-xs text-[#92ccff] hover:underline font-mono"
            >
              View Model Card &amp; Equations →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151b2a] text-[#8a919b] font-mono text-[11px] uppercase border-b border-[#263845]">
                <tr>
                  <th className="py-2 px-3">Rank &amp; District</th>
                  <th className="py-2 px-3">Population</th>
                  <th className="py-2 px-3">Risk Level</th>
                  <th className="py-2 px-3">Peak Surge</th>
                  <th className="py-2 px-3">Peak Wind</th>
                  <th className="py-2 px-3">Evac Progress</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263845]">
                {topDistricts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#18232d] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <span className="font-mono text-xs text-[#92ccff] mr-2">#{d.rank}</span>
                      {d.name} ({d.state})
                    </td>
                    <td className="py-2.5 px-3 text-[#c0c7d1] font-mono">
                      {d.populationMillions}M
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        d.riskLevel === 'CRITICAL'
                          ? 'bg-[#ffb4ab] text-[#690005]'
                          : d.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-[#92ccff]/20 text-[#92ccff]'
                      }`}>
                        {d.riskLevel} ({d.overallScore})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                      +{d.peakSurgeM} m
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white">
                      {d.peakWindKt} kt
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#1b2831] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-full"
                            style={{ width: `${Math.round((d.evacuatedCount / d.targetEvacuation) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#8a919b]">
                          {Math.round((d.evacuatedCount / d.targetEvacuation) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={onEnterCommandCenter}
                        className="px-2.5 py-1 bg-[#1b2831] hover:bg-[#263845] text-[#92ccff] rounded text-[11px] font-semibold border border-[#364f63] transition-colors"
                      >
                        Inspect on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
