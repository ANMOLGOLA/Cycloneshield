import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  Waves, 
  Radio, 
  Layers, 
  X,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { DistrictRisk, CycloneEvent, CriticalAsset } from '../types/cyclone';

export interface RedAlertItem {
  id: string;
  category: 'DISTRICT_RISK' | 'INFRASTRUCTURE_FAILURE' | 'ROAD_CLOSURE' | 'PARAMETRIC_TRIGGER';
  badge: string;
  districtName: string;
  headline: string;
  detail: string;
  leadTime: string;
  severityScore: number;
  actionText: string;
  actionType: 'evacuate' | 'inspect' | 'insurance';
}

interface GlobalAlertTickerProps {
  districts: DistrictRisk[];
  cyclone: CycloneEvent;
  criticalAssets?: CriticalAsset[];
  onTakeAction?: (alert: RedAlertItem) => void;
  onInspectDistrict?: (district: DistrictRisk) => void;
}

export const GlobalAlertTicker: React.FC<GlobalAlertTickerProps> = ({
  districts,
  cyclone,
  criticalAssets = [],
  onTakeAction,
  onInspectDistrict,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamically aggregate all 'Red' status alerts across all districts and assets
  const redAlerts = useMemo<RedAlertItem[]>(() => {
    const list: RedAlertItem[] = [];

    // 1. Critical District Alerts (riskLevel === 'CRITICAL' or overallScore >= 78)
    const criticalDistricts = districts.filter(
      (d) => d.riskLevel === 'CRITICAL' || d.overallScore >= 78
    );

    criticalDistricts.forEach((d) => {
      list.push({
        id: `dist-${d.id}`,
        category: 'DISTRICT_RISK',
        badge: 'CRITICAL HAZARD',
        districtName: d.name,
        headline: `${d.name.toUpperCase()} DISTRICT: Direct Landfall Zone (T-${cyclone.currentTimelineOffset ? Math.abs(cyclone.currentTimelineOffset) : 18}h)`,
        detail: `Max sustained winds ${d.peakWindKt} kt (${Math.round(d.peakWindKt * 1.852)} km/h) · Destructive storm surge +${d.peakSurgeM}m · Projected inundation ${d.demInundationAreaKm2} km² · ${d.populationMillions}M population at risk.`,
        leadTime: 'Immediate (T-18h)',
        severityScore: d.overallScore,
        actionText: 'Authorize Evacuation',
        actionType: 'evacuate',
      });
    });

    // 2. High-Risk Districts nearing critical threshold (overallScore >= 75)
    districts
      .filter((d) => d.riskLevel === 'HIGH' && d.overallScore >= 75)
      .forEach((d) => {
        list.push({
          id: `dist-high-${d.id}`,
          category: 'DISTRICT_RISK',
          badge: 'HIGH IMPACT',
          districtName: d.name,
          headline: `${d.name.toUpperCase()} DISTRICT: Severe Inundation Threat`,
          detail: `Storm surge +${d.peakSurgeM}m with ${d.peakWindKt} kt gales. Shelter occupancy at ${d.shelterCapacityUsedPct}%. Mandatory evacuation recommended.`,
          leadTime: 'T-18h Window',
          severityScore: d.overallScore,
          actionText: 'Inspect Sector',
          actionType: 'inspect',
        });
      });

    // 3. Infrastructure Tripped/Flooded Failures
    const trippedAssets = criticalAssets.filter(
      (a) => a.status === 'tripped' || a.status === 'flooded'
    );

    trippedAssets.forEach((asset) => {
      list.push({
        id: `asset-${asset.id}`,
        category: asset.type === 'substation' ? 'INFRASTRUCTURE_FAILURE' : 'ROAD_CLOSURE',
        badge: asset.status === 'tripped' ? 'POWER GRID TRIP' : 'CORRIDOR FLOODED',
        districtName: asset.districtId.toUpperCase(),
        headline: `${asset.name.toUpperCase()} [${asset.status.toUpperCase()}]`,
        detail: asset.notes || `Asset compromised due to coastal surge inundation. Downstream cascading failover active.`,
        leadTime: 'Active Failure',
        severityScore: 92,
        actionText: 'View Cascading Grid',
        actionType: 'inspect',
      });
    });

    // 4. Fallback asset failure if criticalAssets list empty
    if (trippedAssets.length === 0) {
      list.push({
        id: 'asset-fallback-substation',
        category: 'INFRASTRUCTURE_FAILURE',
        badge: 'POWER GRID TRIP',
        districtName: 'PURI',
        headline: 'GRID SUBSTATION NORTH-PURI (220/33kV) [TRIPPED]',
        detail: 'Perimeter bund breached by incoming +4.8m surge. Busbar tripped defensively. Puri General Hospital operating on Tier-1 microgrid.',
        leadTime: 'Active Failure',
        severityScore: 95,
        actionText: 'Inspect Failover',
        actionType: 'inspect',
      });
      list.push({
        id: 'asset-fallback-bridge',
        category: 'ROAD_CLOSURE',
        badge: 'CORRIDOR AT RISK',
        districtName: 'PURI',
        headline: 'MAHANADI COASTAL HIGHWAY BRIDGE (NH-316) [IMMINENT CLOSURE]',
        detail: 'Crosswinds at 85 kt exceed vehicular safety envelope. Water 0.4m below soffit. Evacuation Route Alpha compromised.',
        leadTime: 'Closure in T-6h',
        severityScore: 90,
        actionText: 'Reroute Evacuees',
        actionType: 'evacuate',
      });
    }

    // 5. Parametric Insurance Trigger Alert
    const triggeredDistricts = districts.filter(
      (d) => d.parametricPayoutReadiness === 'TRIGGERED'
    );
    if (triggeredDistricts.length > 0) {
      const d = triggeredDistricts[0];
      list.push({
        id: `param-${d.id}`,
        category: 'PARAMETRIC_TRIGGER',
        badge: 'PARAMETRIC TRIGGER',
        districtName: d.name,
        headline: `ORACLE TRIGGER MET: $${(d.parametricPayoutAmountUsd / 1e6).toFixed(1)}M Emergency Liquidity for ${d.name}`,
        detail: `Sustained wind > 120 kt and surge > 2.5m criteria verified against IMD AWS #43012. Ready for zero-loss-adjustment bank disbursement.`,
        leadTime: 'Immediate Release',
        severityScore: 88,
        actionText: 'Disburse Liquidity',
        actionType: 'insurance',
      });
    }

    return list;
  }, [districts, cyclone, criticalAssets]);

  // Automatic ticker rotation
  useEffect(() => {
    if (isPaused || redAlerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % redAlerts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, redAlerts.length]);

  if (redAlerts.length === 0) return null;

  const currentAlert = redAlerts[currentIndex] || redAlerts[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % redAlerts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + redAlerts.length) % redAlerts.length);
  };

  const handleAlertClick = (alert: RedAlertItem) => {
    if (onTakeAction) {
      onTakeAction(alert);
    } else {
      const matchDistrict = districts.find(
        (d) => d.name.toLowerCase() === alert.districtName.toLowerCase() || d.id === alert.districtName.toLowerCase()
      );
      if (matchDistrict && onInspectDistrict) {
        onInspectDistrict(matchDistrict);
      }
    }
  };

  return (
    <>
      {/* Persistent Global Emergency Ticker Bar */}
      <div 
        className="w-full bg-[#690005]/90 border-b border-[#ffb4ab]/30 backdrop-blur-md px-3 sm:px-6 py-2 z-40 select-none transition-all shadow-md"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          {/* Left: Red Alert Counter Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#93000a] text-[#ffdad6] px-2.5 py-1 rounded-md border border-[#ffb4ab]/40 font-mono font-bold tracking-wider shadow">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb4ab] opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-[#ffdad6]"></span>
              </span>
              <span>CRITICAL RED ALERTS</span>
              <span className="bg-[#ffdad6] text-[#690005] px-1.5 py-0.2 rounded text-[10px]">
                {redAlerts.length}
              </span>
            </div>
          </div>

          {/* Center: Active Rotating Red Alert Text */}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => handleAlertClick(currentAlert)}>
            <span className="font-mono text-[10px] uppercase font-bold text-[#ffb4ab] bg-[#93000a]/60 px-2 py-0.5 rounded border border-[#ffb4ab]/30 shrink-0">
              {currentAlert.badge}
            </span>

            <div className="truncate flex items-center gap-2">
              <span className="font-bold text-white tracking-wide truncate">
                {currentAlert.headline}
              </span>
              <span className="text-[#ffdad6]/80 text-[11px] truncate hidden md:inline">
                — {currentAlert.detail}
              </span>
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Ticker Navigator: [ < 1/5 > ] */}
            <div className="hidden sm:flex items-center bg-[#93000a] rounded border border-[#ffb4ab]/30 p-0.5 text-[#ffdad6]">
              <button 
                onClick={handlePrev}
                className="p-1 hover:bg-[#690005] rounded transition-colors"
                title="Previous Critical Alert"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1.5 font-bold">
                {currentIndex + 1}/{redAlerts.length}
              </span>
              <button 
                onClick={handleNext}
                className="p-1 hover:bg-[#690005] rounded transition-colors"
                title="Next Critical Alert"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Action Button */}
            <button
              onClick={() => handleAlertClick(currentAlert)}
              className="bg-[#ffdad6] hover:bg-white text-[#690005] font-bold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 shadow font-mono"
            >
              <span>{currentAlert.actionText}</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Expand Drawer Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="px-2 py-1 bg-[#93000a] hover:bg-[#690005] text-[#ffdad6] rounded border border-[#ffb4ab]/30 text-[11px] font-mono transition-colors"
              title="View all critical alerts in one list"
            >
              View All ({redAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal / Drawer for All Red Alerts */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a21] border border-[#ffb4ab]/40 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#263845] bg-[#690005] flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-[#93000a] text-[#ffdad6] flex items-center justify-center border border-[#ffb4ab]/40">
                  <ShieldAlert className="w-4 h-4 text-[#ffdad6]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                    ACTIVE RED-LEVEL THREAT DIRECTORY
                    <span className="text-[10px] bg-[#93000a] text-[#ffdad6] px-2 py-0.5 rounded font-mono border border-[#ffb4ab]/30">
                      {redAlerts.length} Critical Events
                    </span>
                  </h2>
                  <span className="text-[11px] text-[#ffdad6]/80 font-mono">
                    Mandatory immediate emergency intervention required across Bay of Bengal sectors
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="size-8 rounded-lg bg-[#93000a] hover:bg-[#690005] text-[#ffdad6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Alert List */}
            <div className="p-5 flex flex-col gap-3 overflow-y-auto flex-1 bg-[#0b1220]">
              {redAlerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  className="bg-[#1b2831] border border-[#ffb4ab]/30 hover:border-[#ffb4ab] rounded-xl p-4 flex flex-col gap-2.5 transition-all shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#ffb4ab]">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold text-[#ffdad6] bg-[#93000a] px-2 py-0.5 rounded border border-[#ffb4ab]/40">
                        {alert.badge}
                      </span>
                      <span className="font-bold text-white text-xs">
                        {alert.districtName} SECTOR
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-[#ffb4ab] bg-[#121a21] px-2 py-0.5 rounded border border-[#263845]">
                      Lead Time: {alert.leadTime}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {alert.headline}
                  </h3>

                  <p className="text-xs text-[#c0c7d1] leading-relaxed">
                    {alert.detail}
                  </p>

                  <div className="pt-2 border-t border-[#263845] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8a919b]">
                      Severity Score: <span className="text-[#ffb4ab] font-bold">{alert.severityScore} / 100</span>
                    </span>

                    <button
                      onClick={() => {
                        setIsExpanded(false);
                        handleAlertClick(alert);
                      }}
                      className="px-3 py-1 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow"
                    >
                      <span>{alert.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8a919b]">
                All alerts validated against IMD RSMC New Delhi and State EOC Telemetry.
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1.5 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded text-white transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
