import React from 'react';
import { 
  Activity, 
  X, 
  Radio, 
  Waves, 
  Wind, 
  Gauge, 
  BatteryCharging, 
  CheckCircle,
  Satellite
} from 'lucide-react';
import { TELEMETRY_STATIONS } from '../data/marineTelemetry';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Marine &amp; Coastal Sensor Telemetry
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  6/6 STATIONS ONLINE
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                NIOT Deep-Sea Buoys, IMD Automatic Weather Stations (AWS), and Survey of India Tide Gauges
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

        {/* Station Cards Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {TELEMETRY_STATIONS.map((station) => (
            <div
              key={station.id}
              className="bg-[#1b2831] p-4 rounded-xl border border-[#364f63] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{station.name}</span>
                  </div>
                  <span className="text-[10px] text-[#8a919b] font-mono">
                    Coord: {station.lat}°N, {station.lon}°E · {station.type.toUpperCase()}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  {station.status}
                </span>
              </div>

              {/* Data readings grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#121a21] p-2.5 rounded-lg border border-[#263845] text-xs">
                <div>
                  <span className="text-[9px] text-[#8a919b] uppercase block">Pressure</span>
                  <span className="font-mono text-white font-bold">{station.pressureHpa} <span className="text-[9px]">hPa</span></span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8a919b] uppercase block">Wind (Gust)</span>
                  <span className="font-mono text-white font-bold">{station.windSpeedKt} <span className="text-[9px]">({station.gustKt}kt)</span></span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8a919b] uppercase block">
                    {station.waveHeightM ? 'Wave Height (Hs)' : station.waterLevelM ? 'Tide Water Level' : 'Power Status'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {station.waveHeightM ? `${station.waveHeightM}m` : station.waterLevelM ? `+${station.waterLevelM}m` : `${station.batteryPct}%`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8a919b] pt-1">
                <span>Updated: {station.lastUpdated}</span>
                <span className="font-mono">Battery: {station.batteryPct}%</span>
              </div>
            </div>
          ))}
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
