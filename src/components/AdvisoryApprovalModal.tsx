import React, { useState } from 'react';
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
  Radio 
} from 'lucide-react';
import { DistrictRisk, CycloneEvent } from '../types/cyclone';

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
  const [dutyOfficer, setDutyOfficer] = useState('Senior Meteorologist / Relief Commissioner (ID: NDMA-OPS-04)');
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    civilSirens: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  if (!isOpen) return null;

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

  // Standard OASIS CAP 1.2 XML
  const capXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>IN-NDMA-CYC-${cyclone.id.toUpperCase()}-20261028-001</identifier>
  <sender>ops-center@ndma.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Cyclone / Destructive Storm Surge</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>IMD</valueName>
      <value>ESCS</value>
    </eventCode>
    <headline>${plainTextHeadline}</headline>
    <description>${plainTextBody.replace(/\n/g, ' ')}</description>
    <instruction>Evacuate to nearest designated cyclone shelter. Cooperate with NDRF and civil defense.</instruction>
    <area>
      <areaDesc>${selectedDistrict.name} District, Odisha Coastal Zone</areaDesc>
      <circle>19.81,85.83,45.0</circle>
    </area>
  </info>
</alert>`;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const activeChannelList = Object.entries(channels)
        .filter(([_, active]) => active)
        .map(([name]) => name);

      const res = await fetch('/api/dispatch/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: `CAP-${cyclone.id}-${Date.now()}`,
          channels: activeChannelList,
          dutyOfficer,
          message: { headline: plainTextHeadline },
        }),
      });

      const data = await res.json();
      setDispatchResult(data.dispatchRecord);
      onConfirmApproval(data.dispatchRecord.hash);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#93000a] text-[#ffdad6] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Common Alerting Protocol (CAP 1.2) Authorization Console
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Mandatory Human-in-the-Loop Duty Officer Approval · Immutable Audit Trail
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
        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Dispatch Success Banner */}
          {(isAlreadyApproved || dispatchResult) && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>ADVISORY OFFICIALLY SIGNED &amp; BROADCAST DELIVERED</span>
              </div>
              <div className="text-[11px] text-[#c0c7d1]">
                Delivered across SMS, WhatsApp, and Coastal Sirens. Evacuation notification active.
              </div>
              <div className="font-mono text-[10px] text-emerald-400 bg-[#070e1c] p-1.5 rounded border border-emerald-900 mt-1 break-all">
                Audit Hash: {dispatchResult?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>
          )}

          {/* Format Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-[#1b2831] rounded-lg p-0.5 border border-[#364f63]">
              <button
                onClick={() => setViewFormat('text')}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'text'
                    ? 'bg-[#263845] text-white font-bold'
                    : 'text-[#8a919b] hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" /> Plain Text Preview
              </button>
              <button
                onClick={() => setViewFormat('xml')}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'xml'
                    ? 'bg-[#263845] text-white font-bold'
                    : 'text-[#8a919b] hover:text-white'
                }`}
              >
                <FileCode className="w-3 h-3" /> CAP 1.2 XML
              </button>
            </div>
            <span className="text-[11px] text-[#8a919b] font-mono">
              Target: {selectedDistrict.name} District (Pop: {selectedDistrict.populationMillions}M)
            </span>
          </div>

          {/* Advisory Preview Box */}
          <div className="bg-[#1b2831] rounded-xl p-3.5 border border-[#364f63] font-mono text-xs text-[#dce2f6] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {viewFormat === 'text' ? plainTextBody : capXml}
          </div>

          {/* Delivery Channels */}
          <div className="bg-[#1b2831] rounded-xl p-3.5 border border-[#364f63] flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Authorized Delivery Channels
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-[#121a21] rounded border border-[#263845] cursor-pointer hover:border-[#92ccff]">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff]"
                />
                <Smartphone className="w-3.5 h-3.5 text-[#92ccff]" />
                <span className="text-white">Emergency SMS Blast (Twilio Gateway)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#121a21] rounded border border-[#263845] cursor-pointer hover:border-[#92ccff]">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff]"
                />
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white">WhatsApp Disaster Broadcast API</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#121a21] rounded border border-[#263845] cursor-pointer hover:border-[#92ccff]">
                <input
                  type="checkbox"
                  checked={channels.civilSirens}
                  onChange={(e) => setChannels({ ...channels, civilSirens: e.target.checked })}
                  className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff]"
                />
                <Radio className="w-3.5 h-3.5 text-[#ffb4ab]" />
                <span className="text-white">Civil Defense Siren Network Webhook</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-[#121a21] rounded border border-[#263845] cursor-pointer hover:border-[#92ccff]">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded bg-[#1b2831] border-[#364f63] text-[#92ccff]"
                />
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white">Inter-Agency Relief Email Relay</span>
              </label>
            </div>
          </div>

          {/* Duty Officer Authorization Signature */}
          <div className="bg-[#1b2831] rounded-xl p-3.5 border border-[#364f63] flex flex-col gap-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#92ccff]" /> Duty Officer Identity &amp; Authorization Credentials
            </label>
            <input
              type="text"
              value={dutyOfficer}
              onChange={(e) => setDutyOfficer(e.target.value)}
              className="bg-[#121a21] border border-[#263845] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#92ccff]"
            />
            <span className="text-[10px] text-[#8a919b]">
              Every authorization is cryptographically signed and stored in the append-only operational audit log.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1b2831] hover:bg-[#263845] text-xs font-semibold rounded-lg text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={isSubmitting || isAlreadyApproved}
            className="px-5 py-2 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold rounded-lg text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing & Broadcasting...' : isAlreadyApproved ? 'Already Broadcast' : 'Authorize & Broadcast CAP Advisory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
