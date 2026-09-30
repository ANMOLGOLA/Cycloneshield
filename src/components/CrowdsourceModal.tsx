import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Satellite, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Clock, 
  UploadCloud 
} from 'lucide-react';
import { GROUND_TRUTH_REPORTS, GroundTruthReport } from '../data/groundTruthReports';

interface CrowdsourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrowdsourceModal: React.FC<CrowdsourceModalProps> = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState<GroundTruthReport[]>(GROUND_TRUTH_REPORTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-emerald-400 shadow">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Crowdsourced Ground Truth &amp; SAR Change Detection
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-mono">
                  Bayesian Anti-Spam Active
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Verified citizen field photos, ODRAF squad reports, and Sentinel-1 SAR flood inundation extents
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

        {/* Reports Feed */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl bg-[#1b2831] border border-[#263845] hover:border-[#364f63] transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#121a21] border border-[#263845] text-[#92ccff] font-bold">
                    {rep.sourceType}
                  </span>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {rep.locationName}
                  </h4>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Trust: {rep.trustScorePct}%
                  </span>
                  <span className="text-[#8a919b]">{rep.reportedTimeAgo}</span>
                </div>
              </div>

              <p className="text-xs text-[#c0c7d1] leading-relaxed">
                {rep.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#263845] text-[11px] font-mono">
                <span className="text-white">
                  Observed Flood Depth: <strong className="text-amber-400">+{rep.observedInundationM}m</strong>
                </span>

                {rep.isEmbankmentBreach && (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Embankment Breach Confirmed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            EXIF metadata stripped and GPS coords verified prior to ingestion.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
