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
  HelpCircle 
} from 'lucide-react';
import { calculateStormSurge } from '../geo-core/surgeBathtub';
import { computeHollandIsotachs } from '../geo-core/hollandWind';
import { CycloneEvent } from '../types/cyclone';

interface ScenarioLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  cyclone: CycloneEvent;
  onApplyScenario?: (customParams: any) => void;
}

export const ScenarioLabModal: React.FC<ScenarioLabModalProps> = ({
  isOpen,
  onClose,
  cyclone,
  onApplyScenario,
}) => {
  // Scenario Sliders State
  const [centralPressure, setCentralPressure] = useState(cyclone.centralPressureHpa || 938);
  const [rmaxKm, setRmaxKm] = useState(cyclone.holland.RmaxKm || 34);
  const [translationSpeed, setTranslationSpeed] = useState(cyclone.holland.translationSpeedKt || 12);
  const [landfallOffsetKm, setLandfallOffsetKm] = useState(0); // -80km (South) to +80km (North)
  const [tidePhase, setTidePhase] = useState<'Spring High Tide' | 'Mean High Water' | 'Mean Sea Level' | 'Neap Low Tide'>('Spring High Tide');

  // Reactive Instant Calculation (< 50ms)
  const surgeResults = useMemo(() => {
    // Estimated max wind based on central pressure
    const deltaP = 1010 - centralPressure;
    const estimatedWindKt = Math.min(165, Math.round(14.5 * Math.sqrt(deltaP)));

    return calculateStormSurge({
      centralPressureHpa: centralPressure,
      ambientPressureHpa: 1010,
      maxWindSpeedKt: estimatedWindKt,
      tidePhase,
      landfallOffsetKm,
    });
  }, [centralPressure, tidePhase, landfallOffsetKm]);

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
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Scenario Lab: Storm Surge &amp; Wind Simulation
                <span className="text-[10px] bg-[#1b2831] text-amber-400 px-2 py-0.5 rounded border border-[#364f63] font-mono">
                  Tabletop Mode
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Holland (1980) Wind Field + Bathtub Inundation over Copernicus GLO-30 DEM
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

        {/* Content Grid: Sliders on left, reactive telemetry & cross-section on right */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto flex-1">
          {/* Left Column: Interactive Scenario Sliders */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
              Parameter Controls (Simulated Under 3s)
            </span>

            {/* Slider 1: Central Pressure */}
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
                onChange={(e) => setCentralPressure(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-[#263845] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8a919b] font-mono">
                <span>900 hPa (Cat 5 Super)</span>
                <span>940 hPa (Cat 4)</span>
                <span>990 hPa (Cat 1)</span>
              </div>
            </div>

            {/* Slider 2: Astronomical Tide Phase */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Astronomical Tide Phase:</span>
                <span className="font-mono text-[#92ccff]">{tidePhase}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {(['Spring High Tide', 'Mean High Water', 'Mean Sea Level', 'Neap Low Tide'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTidePhase(t)}
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

            {/* Slider 3: Landfall Point Offset */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Landfall Shift (Along Coast):</span>
                <span className="font-mono text-white">
                  {landfallOffsetKm === 0 ? 'Puri (Nominal 0 km)' : landfallOffsetKm > 0 ? `+${landfallOffsetKm} km North (Dhamra)` : `${landfallOffsetKm} km South (Gopalpur)`}
                </span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={landfallOffsetKm}
                onChange={(e) => setLandfallOffsetKm(Number(e.target.value))}
                className="w-full accent-[#92ccff] h-1.5 bg-[#263845] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8a919b] font-mono">
                <span>-60 km South</span>
                <span>Nominal Track</span>
                <span>+60 km North</span>
              </div>
            </div>

            {/* Slider 4: Radius of Maximum Winds (Rmax) */}
            <div className="bg-[#1b2831] p-3 rounded-xl border border-[#263845] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Rmax (Radius of Max Wind):</span>
                <span className="font-mono text-white font-bold">{rmaxKm} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="65"
                value={rmaxKm}
                onChange={(e) => setRmaxKm(Number(e.target.value))}
                className="w-full accent-[#92ccff] h-1.5 bg-[#263845] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Computed Surge & Inundation Outputs */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
              Simulated Outputs &amp; Elevation Cross-Section
            </span>

            {/* Total Water Level Hero Card */}
            <div className="bg-[#1b2831] p-4 rounded-xl border border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8a919b] uppercase font-bold">
                  Peak Storm Surge (Total Water Level)
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  ±0.6m Uncertainty
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

              <div className="text-[10px] text-emerald-400 font-mono bg-[#121a21] p-2 rounded border border-[#263845]">
                Estimated Coastal Inundation Footprint: <span className="font-bold text-white">{surgeResults.inundationFootprintKm2} km²</span>
              </div>
            </div>

            {/* Inland Bathtub Penetration Cross-Section */}
            <div className="bg-[#1b2831] p-3.5 rounded-xl border border-[#263845] flex flex-col gap-2">
              <span className="text-xs font-bold text-white">
                Inland Penetration over Copernicus DEM (Roughness Attenuation)
              </span>

              {/* Bar graph cross section */}
              <div className="h-28 bg-[#0c1321] rounded-lg p-2 flex items-end justify-between gap-1 border border-[#263845]">
                {surgeResults.depthAtDistanceKm.slice(0, 12).map((slice, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    {slice.floodDepthM > 0 && (
                      <div
                        className="w-full bg-[#ffb4ab] rounded-t transition-all"
                        style={{ height: `${Math.min(90, slice.floodDepthM * 20)}%` }}
                        title={`${slice.distanceInlandKm}km inland: ${slice.floodDepthM}m flood`}
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
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded text-[#8a919b] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Nominal Forecast
          </button>

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
