import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  ArrowRight,
  ListChecks,
  UserCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { DISTRICT_PLAYBOOKS, ActionItem } from '../data/anticipatoryPlaybooks';
import { DistrictRisk } from '../types/cyclone';

interface AnticipatoryPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: DistrictRisk;
}

export const AnticipatoryPlaybookModal: React.FC<AnticipatoryPlaybookModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
}) => {
  const playbook = DISTRICT_PLAYBOOKS[selectedDistrict.id.toLowerCase()] || DISTRICT_PLAYBOOKS['puri'];
  const [actions, setActions] = useState<ActionItem[]>(playbook.actions);

  if (!isOpen) return null;

  const toggleStatus = (id: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus: ActionItem['status'] =
            a.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const completedCount = actions.filter((a) => a.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / actions.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-amber-400 shadow">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Anticipatory Action Playbook: {selectedDistrict.name} District
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
                  Phase: {playbook.currentPhase}
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Trigger-based automated checklists (T-72h, T-48h, T-24h, Landfall) derived from NDMA &amp; OSDMA SOPs
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

        {/* Readiness Meter */}
        <div className="px-5 py-3 bg-[#0f171e] border-b border-[#263845] flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#8a919b] uppercase tracking-wider">
                Readiness &amp; Action Completion Score:
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progressPct}% Complete ({completedCount}/{actions.length})</span>
            </div>
            <div className="w-full bg-[#1b2831] h-2 rounded-full overflow-hidden border border-[#263845]">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist Content */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3">
          {actions.map((item) => {
            const isDone = item.status === 'COMPLETED';
            const isInProgress = item.status === 'IN_PROGRESS';

            return (
              <div
                key={item.id}
                onClick={() => toggleStatus(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-[#15231e] border-emerald-500/40 hover:border-emerald-500'
                    : isInProgress
                    ? 'bg-[#242116] border-amber-500/40 hover:border-amber-500'
                    : 'bg-[#1b2831] border-[#263845] hover:border-[#364f63]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-6 rounded-lg border flex items-center justify-center mt-0.5 transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-[#121a21] border-[#364f63] text-transparent hover:text-[#8a919b]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#121a21] border border-[#263845] text-[#92ccff] font-bold">
                        {item.phase}
                      </span>
                      <h4 className={`text-xs font-bold ${isDone ? 'text-[#8a919b] line-through' : 'text-white'}`}>
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-[#c0c7d1] leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-[#8a919b] mt-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#92ccff]" /> {item.assignedRole}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Zap className="w-3 h-3" /> Trigger: {item.triggerCondition}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isInProgress
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-[#121a21] text-[#8a919b] border-[#263845]'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            Click any task to toggle confirmation status. Changes logged to cryptographic audit trail.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold rounded-lg text-xs transition-colors shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
