import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DistrictRisk } from '../types/cyclone';

interface PriorityDistrictsCardProps {
  districts: DistrictRisk[];
  selectedDistrict: DistrictRisk;
  onSelectDistrict: (d: DistrictRisk) => void;
}

export const PriorityDistrictsCard: React.FC<PriorityDistrictsCardProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
}) => {
  // Sort by rank and take top 5
  const top5 = [...districts].sort((a, b) => a.rank - b.rank).slice(0, 5);

  return (
    <div className="absolute top-4 right-4 bg-[#121a21]/95 backdrop-blur-md border border-[#263845] rounded-xl p-4 shadow-2xl z-10 w-80 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#263845]">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Top-5 Priority Districts
        </span>
        <span className="text-[10px] text-[#8a919b] font-mono">Risk Ranked</span>
      </div>

      <div className="flex flex-col gap-2.5 pt-3">
        {top5.map((d) => {
          const isSelected = selectedDistrict.id === d.id;

          // Render trend icon
          let TrendIcon = Minus;
          let trendColor = 'text-amber-400';
          if (d.trend === 'up') {
            TrendIcon = TrendingUp;
            trendColor = d.riskLevel === 'CRITICAL' ? 'text-[#ffb4ab]' : 'text-amber-400';
          } else if (d.trend === 'down') {
            TrendIcon = TrendingDown;
            trendColor = 'text-emerald-400';
          }

          // Badge style based on level
          let badgeBg = 'bg-[#92ccff]/20 text-[#92ccff] border-[#92ccff]/30';
          let borderStyle = 'border-transparent';

          if (d.riskLevel === 'CRITICAL') {
            badgeBg = 'bg-[#ffb4ab] text-[#690005] font-bold';
            borderStyle = 'border-[#ffb4ab]/40';
          } else if (d.riskLevel === 'HIGH') {
            badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            borderStyle = 'border-amber-500/30';
          } else if (d.riskLevel === 'MODERATE') {
            badgeBg = 'bg-[#92ccff]/20 text-[#92ccff]';
            borderStyle = 'border-[#364f63]';
          }

          return (
            <div
              key={d.id}
              onClick={() => onSelectDistrict(d)}
              className={`flex items-center justify-between bg-[#1b2831] p-2 rounded-lg border transition-all cursor-pointer ${borderStyle} ${
                isSelected ? 'ring-2 ring-[#92ccff] bg-[#232a39]' : 'hover:bg-[#263845]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold ${
                    d.rank === 1
                      ? 'text-[#ffb4ab]'
                      : d.rank <= 3
                      ? 'text-amber-400'
                      : 'text-[#92ccff]'
                  }`}
                >
                  #{d.rank}
                </span>
                <div>
                  <span className="text-sm font-semibold text-white block leading-none">
                    {d.name}
                  </span>
                  <span className="text-[10px] text-[#8a919b]">
                    Pop: {d.populationMillions}M
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeBg}`}>
                  {d.riskLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
