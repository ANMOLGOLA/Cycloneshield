import React from 'react';
import { Radar, Waves, Eye, Compass, Mountain, Network, ShieldCheck } from 'lucide-react';

export interface LayerState {
  stormTrackOpacity: number;
  stormTrackVisible: boolean;
  hazardOpacity: number;
  hazardVisible: boolean;
  exposureOpacity: number;
  exposureVisible: boolean;
  populationOpacity: number;
  populationVisible: boolean;
  showRadarOverlay: boolean;
  showSurgeOverlay: boolean;
  showHollandRings: boolean;
  showBathymetry: boolean;
  showCascadingLinks: boolean;
}

interface LayerRailProps {
  layers: LayerState;
  onChangeLayers: (updated: Partial<LayerState>) => void;
  onOpenModelCard?: () => void;
}

export const LayerRail: React.FC<LayerRailProps> = ({
  layers,
  onChangeLayers,
  onOpenModelCard,
}) => {
  return (
    <aside className="w-72 bg-[#121a21] border-r border-[#263845] flex flex-col z-10 transition-all duration-300 select-none">
      {/* Rail Header */}
      <div className="p-3 border-b border-[#263845] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
          Layer Controls
        </span>
        <button
          onClick={onOpenModelCard}
          className="text-[10px] bg-[#1b2831] text-[#92ccff] px-2 py-0.5 rounded border border-[#364f63] hover:bg-[#263845] transition-colors"
          title="Click to view model provenance and validation"
        >
          Screening-level model
        </button>
      </div>

      {/* Layer Sliders */}
      <div className="p-4 flex flex-col gap-5 overflow-y-auto flex-1">
        {/* Layer 1: Storm Track & Intensity */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer">
              <input
                type="checkbox"
                checked={layers.stormTrackVisible}
                onChange={(e) => onChangeLayers({ stormTrackVisible: e.target.checked })}
                className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff] focus:ring-0 cursor-pointer"
              />
              <span>Storm Track & Intensity</span>
            </label>
            <span className="font-mono text-xs text-[#8a919b]">{layers.stormTrackOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layers.stormTrackOpacity}
            onChange={(e) => onChangeLayers({ stormTrackOpacity: Number(e.target.value) })}
            className="w-full accent-[#92ccff] h-1 bg-[#263845] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Layer 2: Hazard (Wind/Surge) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer">
              <input
                type="checkbox"
                checked={layers.hazardVisible}
                onChange={(e) => onChangeLayers({ hazardVisible: e.target.checked })}
                className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff] focus:ring-0 cursor-pointer"
              />
              <span>Hazard (Wind/Surge)</span>
            </label>
            <span className="font-mono text-xs text-[#8a919b]">{layers.hazardOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layers.hazardOpacity}
            onChange={(e) => onChangeLayers({ hazardOpacity: Number(e.target.value) })}
            className="w-full accent-[#92ccff] h-1 bg-[#263845] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Layer 3: Exposure (Assets/Infrastruct.) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer">
              <input
                type="checkbox"
                checked={layers.exposureVisible}
                onChange={(e) => onChangeLayers({ exposureVisible: e.target.checked })}
                className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff] focus:ring-0 cursor-pointer"
              />
              <span>Exposure (Assets/Infrastruct.)</span>
            </label>
            <span className="font-mono text-xs text-[#8a919b]">{layers.exposureOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layers.exposureOpacity}
            onChange={(e) => onChangeLayers({ exposureOpacity: Number(e.target.value) })}
            className="w-full accent-[#92ccff] h-1 bg-[#263845] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Layer 4: Population Vulnerability */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer">
              <input
                type="checkbox"
                checked={layers.populationVisible}
                onChange={(e) => onChangeLayers({ populationVisible: e.target.checked })}
                className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff] focus:ring-0 cursor-pointer"
              />
              <span>Population Vulnerability</span>
            </label>
            <span className="font-mono text-xs text-[#8a919b]">{layers.populationOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layers.populationOpacity}
            onChange={(e) => onChangeLayers({ populationOpacity: Number(e.target.value) })}
            className="w-full accent-[#92ccff] h-1 bg-[#263845] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <hr className="border-[#263845] my-1" />

        {/* Map Overlays */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8a919b]">
            Map Overlays
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeLayers({ showRadarOverlay: !layers.showRadarOverlay })}
              className={`text-xs py-2 px-3 rounded border transition-colors flex items-center justify-center gap-1.5 ${
                layers.showRadarOverlay
                  ? 'bg-[#263845] text-[#92ccff] border-[#92ccff] font-bold shadow'
                  : 'bg-[#1b2831] hover:bg-[#263845] text-white border-[#364f63]'
              }`}
            >
              <Radar className="w-3.5 h-3.5 text-[#92ccff]" /> Radar
            </button>

            <button
              onClick={() => onChangeLayers({ showSurgeOverlay: !layers.showSurgeOverlay })}
              className={`text-xs py-2 px-3 rounded border transition-colors flex items-center justify-center gap-1.5 ${
                layers.showSurgeOverlay
                  ? 'bg-[#263845] text-amber-400 border-amber-400 font-bold shadow'
                  : 'bg-[#1b2831] hover:bg-[#263845] text-white border-[#364f63]'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-amber-400" /> Surge
            </button>
          </div>
        </div>

        {/* Tactical Geometry Overlays */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a919b]">
            Tactical Analysis
          </span>

          <label className="flex items-center justify-between text-xs text-[#c0c7d1] cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#92ccff]" /> Holland Isotachs (34/50/64kt)
            </span>
            <input
              type="checkbox"
              checked={layers.showHollandRings}
              onChange={(e) => onChangeLayers({ showHollandRings: e.target.checked })}
              className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#c0c7d1] cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" /> Copernicus DEM &amp; Bathymetry
            </span>
            <input
              type="checkbox"
              checked={layers.showBathymetry}
              onChange={(e) => onChangeLayers({ showBathymetry: e.target.checked })}
              className="rounded bg-[#1b2831] border-[#364f63] text-emerald-400"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#c0c7d1] cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-[#ffb4ab]" /> Cascading Grid Vectors
            </span>
            <input
              type="checkbox"
              checked={layers.showCascadingLinks}
              onChange={(e) => onChangeLayers({ showCascadingLinks: e.target.checked })}
              className="rounded bg-[#1b2831] border-[#364f63] text-[#ffb4ab]"
            />
          </label>
        </div>

        {/* Data Source Audit Stamp */}
        <div className="mt-auto pt-3 border-t border-[#263845] text-[10px] text-[#8a919b] font-mono leading-relaxed">
          <div>GEE: GLO-30 DEM (30m)</div>
          <div>ESA WorldCover 2021 v2</div>
          <div>IMD RSMC Delhi V07 / JTWC</div>
        </div>
      </div>
    </aside>
  );
};
