import React, { useState, useMemo } from 'react';
import { 
  Wind, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Navigation, 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from 'lucide-react';
import { CycloneEvent, TrackPoint } from '../types/cyclone';

interface StormStatusStripProps {
  cyclone: CycloneEvent;
  currentTrackPoint: TrackPoint;
  previousTrackPoint?: TrackPoint;
  onOpenHollandModel?: () => void;
}

// Great-circle Haversine formula to compute geodesic distance between two points in km
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute compass bearing from pt1 to pt2
function calculateCompassBearing(lat1: number, lon1: number, lat2: number, lon2: number): { degrees: number; compass: string } {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(brng / 22.5) % 16;
  return {
    degrees: Math.round(brng),
    compass: points[idx],
  };
}

export const StormStatusStrip: React.FC<StormStatusStripProps> = ({
  cyclone,
  currentTrackPoint,
  previousTrackPoint,
  onOpenHollandModel,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Dynamic values responding to current timeline position
  const windSpeed = currentTrackPoint.windSpeedKt;
  const centralPressure = currentTrackPoint.centralPressureHpa;
  const surgePeak = currentTrackPoint.surgePeakM;
  const stage = currentTrackPoint.stage || cyclone.category;

  // Dynamically calculate translational speed (km/h) based on geodesic delta
  const translationalMetrics = useMemo(() => {
    // If no previous point provided, find the point before current in cyclone.track
    let prev = previousTrackPoint;
    if (!prev) {
      const curIdx = cyclone.track.findIndex((p) => p.timeOffsetHours === currentTrackPoint.timeOffsetHours);
      if (curIdx > 0) {
        prev = cyclone.track[curIdx - 1];
      }
    }

    if (!prev) {
      // Fallback using cyclone nominal translation speed
      const fallbackSpeedKmH = Math.round(cyclone.holland.translationSpeedKt * 1.852);
      return {
        speedKmH: fallbackSpeedKmH,
        speedKt: cyclone.holland.translationSpeedKt,
        distanceKm: fallbackSpeedKmH * 6,
        timeDeltaHours: 6,
        bearingDeg: 340,
        bearingCompass: 'NNW',
        trend: 'flat' as const,
        trendPct: '0.0%',
      };
    }

    const distanceKm = calculateHaversineDistanceKm(prev.lat, prev.lon, currentTrackPoint.lat, currentTrackPoint.lon);
    const timeDeltaHours = Math.max(1, Math.abs(currentTrackPoint.timeOffsetHours - prev.timeOffsetHours));
    const speedKmH = Number((distanceKm / timeDeltaHours).toFixed(1));
    const speedKt = Number((speedKmH / 1.852).toFixed(1));
    const bearing = calculateCompassBearing(prev.lat, prev.lon, currentTrackPoint.lat, currentTrackPoint.lon);

    // Calculate acceleration/deceleration vs nominal speed
    const nominalSpeedKmH = cyclone.holland.translationSpeedKt * 1.852;
    const diff = speedKmH - nominalSpeedKmH;
    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (diff > 1.5) trend = 'up';
    else if (diff < -1.5) trend = 'down';

    const trendPct = `${diff >= 0 ? '+' : ''}${((diff / nominalSpeedKmH) * 100).toFixed(0)}%`;

    return {
      speedKmH,
      speedKt,
      distanceKm: Number(distanceKm.toFixed(1)),
      timeDeltaHours,
      bearingDeg: bearing.degrees,
      bearingCompass: bearing.compass,
      trend,
      trendPct,
    };
  }, [cyclone, currentTrackPoint, previousTrackPoint]);

  return (
    <div className="absolute top-4 left-4 bg-[#121a21]/95 backdrop-blur-md border border-[#263845] rounded-xl p-4 shadow-2xl z-10 w-84 select-none">
      {/* Top Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[#263845]">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff]">
            <Wind className="w-5 h-5 text-[#92ccff] animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-wide">{cyclone.name}</h2>
            <span className="text-[10px] text-[#ffb4ab] uppercase font-mono tracking-wider block">
              {stage}
            </span>
          </div>
        </div>
        <span className="text-xs font-mono bg-[#ffb4ab]/20 text-[#ffb4ab] px-2 py-0.5 rounded font-bold border border-[#ffb4ab]/30">
          CRITICAL
        </span>
      </div>

      {/* Primary 4-quadrant metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 pb-2.5 border-b border-[#263845]">
        <div>
          <span className="text-[10px] text-[#8a919b] uppercase block tracking-wider">
            Wind Speed
          </span>
          <span className="font-mono text-base font-bold text-white">
            {windSpeed} <span className="text-xs font-normal text-[#8a919b]">kt</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8a919b] uppercase block tracking-wider">
            Central Pressure
          </span>
          <span className="font-mono text-base font-bold text-white">
            {centralPressure} <span className="text-xs font-normal text-[#8a919b]">hPa</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8a919b] uppercase block tracking-wider">
            Movement
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            {translationalMetrics.bearingCompass} @ {translationalMetrics.speedKt} kt
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8a919b] uppercase block tracking-wider">
            Coast Distance
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            {cyclone.coastDistanceKm} km
          </span>
        </div>
      </div>

      {/* NEW METRIC PANEL: Dynamic Storm Translational Speed (km/h) */}
      <div className="my-2.5 bg-[#1b2831] rounded-lg p-2.5 border border-[#364f63] flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#92ccff] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#92ccff]" />
            Translational Forward Speed
          </span>
          <span className="text-[9px] font-mono text-[#8a919b] bg-[#121a21] px-1.5 py-0.5 rounded border border-[#263845]">
            Δt: {translationalMetrics.timeDeltaHours}h
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white tracking-tight">
              {translationalMetrics.speedKmH}
            </span>
            <span className="font-mono text-xs font-medium text-[#92ccff]">km/h</span>
            <span className="text-[10px] text-[#8a919b] font-mono">
              ({translationalMetrics.speedKt} kt)
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            {translationalMetrics.trend === 'up' ? (
              <span className="text-amber-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Accel ({translationalMetrics.trendPct})
              </span>
            ) : translationalMetrics.trend === 'down' ? (
              <span className="text-emerald-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> Slowing ({translationalMetrics.trendPct})
              </span>
            ) : (
              <span className="text-[#8a919b] flex items-center">
                <Minus className="w-3 h-3 mr-0.5" /> Steady
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#8a919b] font-mono pt-1 border-t border-[#263845]">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#92ccff]" /> Vector: {translationalMetrics.bearingDeg}° ({translationalMetrics.bearingCompass})
          </span>
          <span>Δ Distance: {translationalMetrics.distanceKm} km</span>
        </div>
      </div>

      {/* Expandable Holland Wind Profile Details */}
      <div className="pt-1 mt-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[11px] text-[#8a919b] hover:text-[#92ccff] transition-colors"
        >
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#92ccff]" /> Holland (1980) Wind Field Parameters
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-2 bg-[#1b2831] rounded-lg p-2.5 border border-[#364f63] text-[11px] font-mono flex flex-col gap-1.5">
            <div className="flex justify-between text-[#c0c7d1]">
              <span>Radius of Max Wind (Rmax):</span>
              <span className="text-white font-bold">{cyclone.holland.RmaxKm} km</span>
            </div>
            <div className="flex justify-between text-[#c0c7d1]">
              <span>Holland Peakedness (B):</span>
              <span className="text-white font-bold">{cyclone.holland.B}</span>
            </div>
            <div className="flex justify-between text-[#c0c7d1]">
              <span>Ambient Pressure (Pn):</span>
              <span className="text-white">{cyclone.holland.Pn} hPa</span>
            </div>
            <div className="flex justify-between text-[#c0c7d1]">
              <span>Peak Storm Surge (Est.):</span>
              <span className="text-amber-400 font-bold">+{surgePeak} m</span>
            </div>
            <div className="flex justify-between text-[#c0c7d1]">
              <span>Landfall Coordinates:</span>
              <span className="text-white">19.80°N, 85.85°E</span>
            </div>
            {onOpenHollandModel && (
              <button
                onClick={onOpenHollandModel}
                className="mt-1 text-center py-1 bg-[#263845] hover:bg-[#364f63] text-[#92ccff] text-[10px] rounded transition-colors"
              >
                Inspect Holland Equation &amp; Isotach Curves →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
