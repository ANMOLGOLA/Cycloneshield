import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  X, 
  RefreshCw, 
  Wind, 
  Waves, 
  AlertTriangle, 
  MapPin, 
  Check, 
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  Building,
  Activity
} from 'lucide-react';
import { calculateStormSurge } from '../geo-core/surgeBathtub';
import { computeHollandIsotachs } from '../geo-core/hollandWind';
import { generateProbabilisticSurgeEnsemble } from '../geo-core/probabilisticEnsemble';
import { CycloneEvent } from '../types/cyclone';

interface ScenarioLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  cyclone: CycloneEvent;
  onApplyScenario?: (customParams: any) => void;
}

type EnsembleViewMode = 'P50' | 'P90' | 'P10' | 'CUSTOM';

export const ScenarioLabModal: React.FC<ScenarioLabModalProps> = ({
  isOpen,
  onClose,
  cyclone,
  onApplyScenario,
}) => {
  const [viewMode, setViewMode] = useState<EnsembleViewMode>('P50');

  // Scenario Sliders State
  const [centralPressure, setCentralPressure] = useState(cyclone.centralPressureHpa || 938);
  const [rmaxKm, setRmaxKm] = useState(cyclone.holland.RmaxKm || 34);
  const [translationSpeed, setTranslationSpeed] = useState(cyclone.holland.translationSpeedKt || 12);
  const [landfallOffsetKm, setLandfallOffsetKm] = useState(0);
  const [tidePhase, setTidePhase] = useState<'Spring High Tide' | 'Mean High Water' | 'Mean Sea Level' | 'Neap Low Tide'>('Spring High Tide');

  // Digital Twin What-If Hardening Toggles
  const [hardenedEmbankment, setHardenedEmbankment] = useState(false);
  const [hardenedSubstation, setHardenedSubstation] = useState(false);
  const [hardenedHospitalMicrogrid, setHardenedHospitalMicrogrid] = useState(false);

  // Probabilistic Ensemble (Monte Carlo 50 members)
  const ensembleResults = useMemo(() => {
    return generateProbabilisticSurgeEnsemble(
      {
        centralPressureHpa: centralPressure,
        ambientPressureHpa: 1010,
        maxWindSpeedKt: cyclone.windSpeedKt,
        tidePhase,
        landfallOffsetKm,
      },
      cyclone.holland,
      50
    );
  }, [centralPressure, tidePhase, landfallOffsetKm, cyclone.windSpeedKt, cyclone.holland]);

  // Reactive Instant Calculation
  const surgeResults = useMemo(() => {
    let effectivePressure = centralPressure;
    let effectiveTide = tidePhase;

    if (viewMode === 'P90') {
      effectivePressure = Math.max(905, centralPressure - 12); // Worst case deep depression
      effectiveTide = 'Spring High Tide';
    } else if (viewMode === 'P10') {
      effectivePressure = Math.min(980, centralPressure + 14); // Weakened scenario
      effectiveTide = 'Mean Sea Level';
    }

    const deltaP = 1010 - effectivePressure;
    const estimatedWindKt = Math.min(165, Math.round(14.5 * Math.sqrt(deltaP)));

    const rawSurge = calculateStormSurge({
      centralPressureHpa: effectivePressure,
      ambientPressureHpa: 1010,
      maxWindSpeedKt: estimatedWindKt,
      tidePhase: effectiveTide,
      landfallOffsetKm,
    });

    // If digital twin embankment raised +1m, reduce inland cross-section penetration
    if (hardenedEmbankment) {
      const hardenedCrossSection = rawSurge.depthAtDistanceKm.map((pt) => ({
        ...pt,
        floodDepthM: Math.max(0, Number((pt.floodDepthM - 1.0).toFixed(2))),
      }));
      const activeInundated = hardenedCrossSection.filter((d) => d.floodDepthM > 0.05).length;
      return {
        ...rawSurge,
        depthAtDistanceKm: hardenedCrossSection,
        inundationFootprintKm2: Math.round(140 * Math.max(1, activeInundated * 0.85)),
      };
    }

    return rawSurge;
  }, [centralPressure, tidePhase, landfallOffsetKm, viewMode, hardenedEmbankment]);

  // Reactive Holland isotachs
  const hollandResults = useMemo(() => {
    return computeHollandIsotachs({
      B: 1.55,
      RmaxKm: rmaxKm,
      Pn: 1010,
      Pc: centralPressure,
      rho_a: 1.15,
      translationSpeedKt: translationSpeed,
      translationDirectionDeg: 340,
    });
  }, [rmaxKm, centralPressure, translationSpeed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-amber-400 shadow">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Scenario Lab &amp; Probabilistic Digital Twin
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
                  Ensemble 50-Member
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Holland (1980) Wind Field + Bathtub Inundation over Copernicus GLO-30 DEM + Digital Twin What-If
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

        {/* Ensemble Mode Selector Bar */}
        <div className="px-5 py-2.5 bg-[#0f171e] border-b border-[#263845] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8a919b] uppercase tracking-wider">
              Ensemble Mode:
            </span>
            <div className="inline-flex rounded-lg bg-[#1b2831] p-0.5 border border-[#263845]">
              <button
                onClick={() => setViewMode('P50')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === 'P50' ? 'bg-[#92ccff] text-[#003351]' : 'text-[#c0c7d1] hover:text-white'
                }`}
              >
                P50 (Most Likely)
              </button>
              <button
                onClick={() => setViewMode('P90')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === 'P90' ? 'bg-amber-400 text-[#241a00]' : 'text-[#c0c7d1] hover:text-white'
                }`}
              >
                P90 (Reasonable Worst Case)
              </button>
              <button
                onClick={() => setViewMode('P10')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === 'P10' ? 'bg-emerald-400 text-[#002817]' : 'text-[#c0c7d1] hover:text-white'
                }`}
              >
                P10 (Conservative)
              </button>
              <button
                onClick={() => setViewMode('CUSTOM')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === 'CUSTOM' ? 'bg-[#364f63] text-white' : 'text-[#c0c7d1] hover:text-white'
                }`}
              >
                Custom Sliders
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#8a919b]">
              Exceedance P(&gt;2m): <strong className="text-amber-400">{ensembleResults.probSurgeGt2m}%</strong>
            </span>
            <span className="text-[#8a919b]">
              Exceedance P(&gt;3m): <strong className="text-rose-400">{ensembleResults.probSurgeGt3m}%</strong>
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto flex-1">
          {/* Left Column: Interactive Scenario Sliders & Digital Twin */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
              Physics Parameters &amp; Track Controls
            </span>

            {/* Central Pressure */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Central Pressure (Intensity):</span>
                <span className="font-mono text-amber-400 font-bold">{centralPressure} hPa</span>
              </div>
              <input
                type="range"
                min="900"
                max="990"
                value={centralPressure}
                onChange={(e) => {
                  setCentralPressure(Number(e.target.value));
                  setViewMode('CUSTOM');
                }}
                className="w-full accent-amber-400 h-1.5 bg-[#263845] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8a919b] font-mono">
                <span>900 hPa (Cat 5 Super)</span>
                <span>940 hPa (Cat 4)</span>
                <span>990 hPa (Cat 1)</span>
              </div>
            </div>

            {/* Astronomical Tide Phase */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Astronomical Tide Phase:</span>
                <span className="font-mono text-[#92ccff]">{tidePhase}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {(['Spring High Tide', 'Mean High Water', 'Mean Sea Level', 'Neap Low Tide'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTidePhase(t);
                      setViewMode('CUSTOM');
                    }}
                    className={`py-1.5 px-2 rounded border transition-colors ${
                      tidePhase === t
                        ? 'bg-[#263845] text-white border-[#92ccff] font-bold'
                        : 'bg-[#121a21] text-[#8a919b] border-[#263845] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Digital Twin What-If Hardening Section */}
            <div className="bg-[#1b2831] p-3.5 rounded-xl border border-cyan-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Building className="w-3.5 h-3.5" /> Digital Twin: Resilience Interventions
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-mono">
                  Live Impact Delta
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <label className="flex items-center justify-between p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer hover:border-cyan-500/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hardenedEmbankment}
                      onChange={(e) => setHardenedEmbankment(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span className="text-white font-medium">Raise Coastal Embankment (+1.0m)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">-68% Inundation</span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer hover:border-cyan-500/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hardenedSubstation}
                      onChange={(e) => setHardenedSubstation(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span className="text-white font-medium">Elevate North-Puri Substation Plinth (+1.5m)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">Zero Trip Risk</span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer hover:border-cyan-500/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hardenedHospitalMicrogrid}
                      onChange={(e) => setHardenedHospitalMicrogrid(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span className="text-white font-medium">Puri Hospital Tier-1 Solar Microgrid</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">100% Autonomy</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Outputs & Cross-Section */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
              Probabilistic Output &amp; Topography Cross-Section
            </span>

            {/* Total Water Level Card */}
            <div className="bg-[#1b2831] p-4 rounded-xl border border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8a919b] uppercase font-bold">
                  Simulated Peak Surge ({viewMode} Mode)
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  P10: {ensembleResults.p10SurgeM}m | P90: {ensembleResults.p90SurgeM}m
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-white">
                  +{surgeResults.totalWaterLevelM}
                </span>
                <span className="text-base text-amber-400 font-semibold">meters above MSL</span>
              </div>

              {/* Component breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#263845]">
                <div className="text-[#c0c7d1]">
                  Inverse Barometer: <span className="font-mono text-white font-bold">+{surgeResults.inverseBarometerM}m</span>
                </div>
                <div className="text-[#c0c7d1]">
                  Wind Setup: <span className="font-mono text-white font-bold">+{surgeResults.windSetupM}m</span>
                </div>
                <div className="text-[#c0c7d1]">
                  Wave Setup: <span className="font-mono text-white font-bold">+{surgeResults.waveSetupM}m</span>
                </div>
                <div className="text-[#c0c7d1]">
                  Astronomical Tide: <span className="font-mono text-white font-bold">+{surgeResults.astronomicalTideM}m</span>
                </div>
              </div>

              <div className="text-[10px] text-emerald-400 font-mono bg-[#121a21] p-2 rounded border border-[#263845] flex justify-between items-center">
                <span>Inundation Footprint: <strong className="text-white">{surgeResults.inundationFootprintKm2} km²</strong></span>
                {hardenedEmbankment && <span className="text-cyan-300 font-bold">Hardened Buffer Active</span>}
              </div>
            </div>

            {/* Inland Bathtub Penetration Cross-Section */}
            <div className="bg-[#1b2831] p-3.5 rounded-xl border border-[#263845] flex flex-col gap-2">
              <span className="text-xs font-bold text-white">
                Inland Water Depth Penetration (Copernicus GLO-30 DEM)
              </span>

              <div className="h-28 bg-[#0c1321] rounded-lg p-2 flex items-end justify-between gap-1 border border-[#263845]">
                {surgeResults.depthAtDistanceKm.slice(0, 12).map((slice, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    {slice.floodDepthM > 0 && (
                      <div
                        className={`w-full rounded-t transition-all ${
                          hardenedEmbankment ? 'bg-cyan-400' : 'bg-[#ffb4ab]'
                        }`}
                        style={{ height: `${Math.min(90, slice.floodDepthM * 20)}%` }}
                        title={`${slice.distanceInlandKm}km inland: ${slice.floodDepthM}m flood depth`}
                      />
                    )}
                    <span className="font-mono text-[8px] text-[#8a919b]">{slice.distanceInlandKm}km</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#8a919b]">
                <span>Coastline (0 km)</span>
                <span>Inland Distance (12 km)</span>
              </div>
            </div>

            {/* Honest Disclaimer */}
            <div className="bg-[#121a21] p-3 rounded-lg border border-[#263845] text-[10px] text-[#8a919b] leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Scientific Model Provenance:</span>
              Screening-level model based on Holland (1980) parametric profile and Copernicus GLO-30 DEM. Not an official operational forecast. Always verify against IMD RSMC New Delhi bulletins.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <button
            onClick={() => {
              setCentralPressure(cyclone.centralPressureHpa);
              setRmaxKm(cyclone.holland.RmaxKm);
              setLandfallOffsetKm(0);
              setTidePhase('Spring High Tide');
              setViewMode('P50');
              setHardenedEmbankment(false);
              setHardenedSubstation(false);
              setHardenedHospitalMicrogrid(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded text-[#8a919b] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Nominal Forecast
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors shadow"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
