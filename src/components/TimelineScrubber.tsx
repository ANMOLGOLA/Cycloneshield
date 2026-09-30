import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TrackPoint } from '../types/cyclone';

interface TimelineScrubberProps {
  trackPoints: TrackPoint[];
  currentTrackIndex: number;
  onSelectTrackIndex: (index: number) => void;
  landfallEta: string;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  trackPoints,
  currentTrackIndex,
  onSelectTrackIndex,
  landfallEta,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      const delay = 1800 / playbackSpeed;
      interval = setInterval(() => {
        onSelectTrackIndex((currentTrackIndex + 1) % trackPoints.length);
      }, delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, currentTrackIndex, trackPoints.length, onSelectTrackIndex]);

  const currentPt = trackPoints[currentTrackIndex] || trackPoints[0];

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-[#121a21]/95 backdrop-blur-md border border-[#263845] rounded-xl p-4 shadow-2xl z-10 flex flex-col gap-3 select-none">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center size-9 rounded-lg bg-[#92ccff] text-[#003351] hover:bg-[#cce5ff] transition-colors shadow"
            title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-[#1b2831] rounded-lg p-0.5 border border-[#364f63]">
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  playbackSpeed === spd
                    ? 'font-bold bg-[#263845] text-white shadow-sm'
                    : 'text-[#8a919b] hover:text-white'
                }`}
              >
                {spd}X
              </button>
            ))}
          </div>

          {/* Timeline Position Display */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8a919b] uppercase tracking-wider">
              Timeline Position
            </span>
            <span className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
              <span>{currentPt.label}</span>
              <span className="text-xs font-normal text-[#8a919b]">
                (Landfall ETA: {landfallEta})
              </span>
            </span>
          </div>
        </div>

        {/* Right metrics and reset */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[#8a919b]">Wind Surge Trend:</span>
            {/* Sparkline trend bars */}
            <div className="h-6 bg-[#1b2831] rounded flex items-end px-1.5 py-1 gap-1 border border-[#364f63]">
              <div className="w-1.5 bg-[#92ccff]/40 h-2 rounded-t" title="T-72h"></div>
              <div className="w-1.5 bg-[#92ccff]/60 h-3 rounded-t" title="T-48h"></div>
              <div className="w-1.5 bg-[#92ccff] h-4.5 rounded-t" title="T-24h"></div>
              <div className="w-1.5 bg-amber-400 h-5.5 rounded-t" title="T-18h"></div>
              <div className="w-1.5 bg-[#ffb4ab] h-6 rounded-t" title="Peak Surge"></div>
              <div className="w-1.5 bg-[#93000a] h-4.5 rounded-t" title="Landfall"></div>
            </div>
          </div>

          {/* Reset Live Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              // Find index of T-18h (current)
              const curIdx = trackPoints.findIndex((p) => p.timeOffsetHours === -18);
              onSelectTrackIndex(curIdx !== -1 ? curIdx : 0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2831] hover:bg-[#263845] rounded-lg border border-[#364f63] text-xs text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#92ccff]" />
            <span>Reset Live</span>
          </button>
        </div>
      </div>

      {/* Scrubber Track & Tick Marks */}
      <div className="relative flex flex-col gap-1.5 pt-1">
        <input
          type="range"
          min="0"
          max={trackPoints.length - 1}
          value={currentTrackIndex}
          onChange={(e) => {
            setIsPlaying(false);
            onSelectTrackIndex(Number(e.target.value));
          }}
          className="w-full accent-[#92ccff] h-2 bg-[#1b2831] rounded-lg appearance-none cursor-pointer border border-[#364f63]"
        />

        {/* Tick labels */}
        <div className="flex justify-between font-mono text-[10px] text-[#8a919b] px-0.5">
          {trackPoints.map((pt, idx) => {
            const isSelected = idx === currentTrackIndex;
            return (
              <span
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectTrackIndex(idx);
                }}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'text-white font-bold bg-[#263845] px-1 rounded'
                    : 'hover:text-white'
                }`}
              >
                {pt.label.replace(' (Current)', '')}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
