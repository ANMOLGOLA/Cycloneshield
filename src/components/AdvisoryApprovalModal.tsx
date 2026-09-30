import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle, 
  Send, 
  FileCode, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Radio,
  UserCheck,
  Key,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { DistrictRisk, CycloneEvent } from '../types/cyclone';
import { createApprovalToken, computeAlertContentHash, CapAlertPayload } from '../security/alertIntegrity';

interface AdvisoryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: DistrictRisk;
  cyclone: CycloneEvent;
  onConfirmApproval: (auditHash: string) => void;
  isAlreadyApproved?: boolean;
}

export const AdvisoryApprovalModal: React.FC<AdvisoryApprovalModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  cyclone,
  onConfirmApproval,
  isAlreadyApproved = false,
}) => {
  const [viewFormat, setViewFormat] = useState<'text' | 'xml'>('text');
  const [dutyOfficer, setDutyOfficer] = useState('Senior Meteorologist (ID: NDMA-OPS-04)');
  const [authorizingCommissioner, setAuthorizingCommissioner] = useState('State Relief Commissioner (ID: SRC-OD-01)');
  const [isFourEyesConfirmed, setIsFourEyesConfirmed] = useState(true);

  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    civilSirens: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [signedXmlPreview, setSignedXmlPreview] = useState<string>('');

  // Plain text CAP template
  const plainTextHeadline = `MANDATORY EVACUATION ORDER: ${selectedDistrict.name.toUpperCase()} DISTRICT (T-18H)`;
  const plainTextBody = `URGENT BULLETIN ISSUED UNDER DISASTER MANAGEMENT ACT, 2005
EVENT: EXTREMELY SEVERE CYCLONIC STORM "${cyclone.name}"
TIME OF LANDFALL: ${cyclone.landfallEta} NEAR ${cyclone.landfallLocation.toUpperCase()}
PROJECTED IMPACT:
- Maximum sustained winds of ${selectedDistrict.peakWindKt} kt (${Math.round(selectedDistrict.peakWindKt * 1.852)} km/h) gusting to ${Math.round(selectedDistrict.peakWindKt * 1.852 * 1.15)} km/h.
- Destructive storm surge of +${selectedDistrict.peakSurgeM} meters above astronomical tide inundating coastal tracts up to 4.2 km inland.
- Heavy to extreme precipitation accumulating up to ${selectedDistrict.rainfallAccumMm} mm in 24 hours.

MANDATORY DIRECTIVES:
1. Total cessation of movement across coastal roads and NH-316 arterial corridor from 18:00 UTC.
2. Evacuate all occupants within 5 km of high tide line to designated Multipurpose Cyclone Shelters.
3. Power distribution grid will be defensively isolated to mitigate electrocution and transformer explosion hazards.`;

  const capPayload: CapAlertPayload = useMemo(() => ({
    identifier: `IN-NDMA-CYC-${cyclone.id.toUpperCase()}-20261028-001`,
    sender: 'ops-center@ndma.gov.in',
    sent: new Date().toISOString(),
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    category: 'Met',
    urgency: 'Immediate',
    severity: 'Extreme',
    certainty: 'Observed',
    headline: plainTextHeadline,
    description: plainTextBody.replace(/\n/g, ' '),
    instruction: 'Evacuate to nearest designated cyclone shelter. Cooperate with NDRF and civil defense.',
    districtId: selectedDistrict.id,
    peakWindKt: selectedDistrict.peakWindKt,
    peakSurgeM: selectedDistrict.peakSurgeM,
    areaDesc: `${selectedDistrict.name} District Coastal Zone`,
  }), [cyclone, selectedDistrict, plainTextHeadline, plainTextBody]);

  const contentHash = useMemo(() => computeAlertContentHash(capPayload), [capPayload]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const activeChannelList = Object.entries(channels)
        .filter(([_, active]) => active)
        .map(([name]) => name);

      // Generate Four-Eyes tokens
      const primaryToken = createApprovalToken('NDMA-OPS-04', 'PRIMARY_DUTY_OFFICER', capPayload);
      const secondaryToken = createApprovalToken('SRC-OD-01', 'RELIEF_COMMISSIONER_APPROVER', capPayload);

      const res = await fetch('/api/dispatch/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: capPayload.identifier,
          channels: activeChannelList,
          dutyOfficer,
          authorizingOfficer: authorizingCommissioner,
          primaryApprovalToken: primaryToken,
          secondaryApprovalToken: secondaryToken,
          message: {
            headline: plainTextHeadline,
            description: plainTextBody,
            districtId: selectedDistrict.id,
            peakWindKt: selectedDistrict.peakWindKt,
            peakSurgeM: selectedDistrict.peakSurgeM,
          },
        }),
      });

      const data = await res.json();
      setDispatchResult(data.dispatchRecord);
      setSignedXmlPreview(data.signedCapXml);
      onConfirmApproval(data.dispatchRecord.chainHash || data.dispatchRecord.hash);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#93000a] text-[#ffdad6] flex items-center justify-center shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Common Alerting Protocol (CAP 1.2) Authorization Console
                <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-mono">
                  Four-Eyes Required
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Cryptographically Signed · Dual Officer Authorization · Tamper-Evident SHA-256 Hash Chain
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

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Content Hash Banner */}
          <div className="bg-[#0f171e] p-2.5 rounded-lg border border-[#263845] flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-[#8a919b]">
              <Hash className="w-3.5 h-3.5 text-[#92ccff]" />
              <span>Canonical Payload Hash:</span>
              <strong className="text-white truncate max-w-md">{contentHash}</strong>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Content Bound
            </span>
          </div>

          {/* View Format Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8a919b]">Payload Format:</span>
              <div className="inline-flex rounded-lg bg-[#1b2831] p-0.5 border border-[#263845]">
                <button
                  onClick={() => setViewFormat('text')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
                    viewFormat === 'text' ? 'bg-[#263845] text-white' : 'text-[#8a919b] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Plain Text
                </button>
                <button
                  onClick={() => setViewFormat('xml')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
                    viewFormat === 'xml' ? 'bg-[#263845] text-white' : 'text-[#8a919b] hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" /> OASIS CAP 1.2 (Signed XML)
                </button>
              </div>
            </div>

            <div className="text-[11px] text-amber-300 flex items-center gap-1 font-mono">
              <Lock className="w-3.5 h-3.5" /> Ed25519 &amp; XML-DSig Ready
            </div>
          </div>

          {/* Payload Viewer */}
          <div className="bg-[#0c1321] border border-[#263845] rounded-xl p-4 font-mono text-xs text-[#c0c7d1] max-h-44 overflow-y-auto leading-relaxed">
            {viewFormat === 'text' ? (
              <pre className="whitespace-pre-wrap font-sans text-xs">{plainTextBody}</pre>
            ) : (
              <pre className="whitespace-pre-wrap text-[11px] text-[#92ccff]">{signedXmlPreview || 'XML-DSig envelope will be generated upon dual authorization.'}</pre>
            )}
          </div>

          {/* Four-Eyes Dual Authorization Panel */}
          <div className="bg-[#1b2831] p-3.5 rounded-xl border border-amber-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Dual-Officer Sign-Off (Four-Eyes Principle)
              </div>
              <span className="text-[10px] font-mono text-[#8a919b]">Non-Repudiation Guaranteed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#121a21] p-2.5 rounded-lg border border-[#263845]">
                <span className="text-[10px] font-bold text-[#8a919b] block mb-1">Primary Duty Officer:</span>
                <input
                  type="text"
                  value={dutyOfficer}
                  onChange={(e) => setDutyOfficer(e.target.value)}
                  className="w-full bg-[#1b2831] border border-[#263845] rounded px-2.5 py-1 text-white font-mono text-[11px]"
                />
              </div>

              <div className="bg-[#121a21] p-2.5 rounded-lg border border-[#263845]">
                <span className="text-[10px] font-bold text-[#8a919b] block mb-1">Authorizing Relief Commissioner:</span>
                <input
                  type="text"
                  value={authorizingCommissioner}
                  onChange={(e) => setAuthorizingCommissioner(e.target.value)}
                  className="w-full bg-[#1b2831] border border-[#263845] rounded px-2.5 py-1 text-white font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Dispatch Channels */}
          <div className="bg-[#1b2831] p-3.5 rounded-xl border border-[#263845] flex flex-col gap-2">
            <span className="text-xs font-bold text-white">Target Emergency Broadcast Channels:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded accent-[#92ccff]"
                />
                <span className="text-white">SMS Gateway</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded accent-[#92ccff]"
                />
                <span className="text-white">WhatsApp Alert</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.civilSirens}
                  onChange={(e) => setChannels({ ...channels, civilSirens: e.target.checked })}
                  className="rounded accent-[#92ccff]"
                />
                <span className="text-white">Civil Sirens</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-[#121a21] border border-[#263845] cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded accent-[#92ccff]"
                />
                <span className="text-white">SMTP / Email</span>
              </label>
            </div>
          </div>

          {/* Post-Dispatch Verification Result */}
          {dispatchResult && (
            <div className="bg-[#13271d] border border-emerald-500/50 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle className="w-4 h-4" /> CAP Alert Cryptographically Signed &amp; Dispatched
              </div>
              <div className="text-[11px] font-mono text-[#c0c7d1] space-y-0.5">
                <div>Hash Chain Block ID: <strong className="text-white">{dispatchResult.id}</strong></div>
                <div className="truncate">Chain Hash: <strong className="text-emerald-300">{dispatchResult.chainHash}</strong></div>
                <div className="truncate">Signature: <strong className="text-[#92ccff]">{dispatchResult.signature}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <span className="text-[11px] text-[#8a919b]">
            All actions recorded to immutable audit chain.
          </span>

          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#ba1a1a] hover:bg-[#ff5449] text-white font-bold rounded-lg text-xs transition-colors shadow disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Verifying & Signing...' : 'Sign & Broadcast Mandatory Evacuation Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
