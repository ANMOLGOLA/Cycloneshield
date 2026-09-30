import React from 'react';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface AlertBannerProps {
  onViewImpact: () => void;
  onApproveAdvisory: () => void;
  isApproved?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  onViewImpact,
  onApproveAdvisory,
  isApproved = false,
}) => {
  return (
    <div className="bg-[#19202e] border-b border-[#2e3544] px-6 py-2 flex items-center justify-between z-20 select-none">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md flex items-center justify-center ${
          isApproved ? 'bg-emerald-950 text-emerald-400' : 'bg-[#93000a] text-[#ffdad6]'
        }`}>
          {isApproved ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#ffdad6]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">
            {isApproved ? 'Advisory Authorized & Dispatched:' : 'Pending Advisory Approval:'}
          </span>
          <span className="text-sm text-[#c0c7d1]">
            {isApproved 
              ? 'CAP 1.2 Evacuation broadcast delivered to 482,190 citizens in Puri & coastal zone (T-18h window).' 
              : 'Evacuation order for Puri district requires mandatory authorization (T-18h window).'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onViewImpact}
          className="px-3 py-1 bg-[#2e3544] hover:bg-[#323949] text-xs font-semibold rounded text-white transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          View Impact Assessment
        </button>
        <button
          onClick={onApproveAdvisory}
          className={`px-3 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1.5 ${
            isApproved 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0c1321]' 
              : 'bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351]'
          }`}
        >
          {isApproved ? 'Authorized (View Dispatch)' : 'Approve Advisory'}
        </button>
      </div>
    </div>
  );
};
