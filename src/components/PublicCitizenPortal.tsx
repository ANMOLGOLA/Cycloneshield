import React from 'react';
import { 
  Shield, 
  MapPin, 
  Wind, 
  Waves, 
  Users, 
  Radio, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { CycloneEvent, DistrictRisk } from '../types/cyclone';

interface PublicCitizenPortalProps {
  cyclone: CycloneEvent;
  districts: DistrictRisk[];
  onOpenShelterFinder: () => void;
}

export const PublicCitizenPortal: React.FC<PublicCitizenPortalProps> = ({
  cyclone,
  districts,
  onOpenShelterFinder,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#070d18] text-[#dce2f6] p-6 lg:p-10 flex flex-col select-none">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Top Citizen Emergency Alert */}
        <div className="bg-[#ba1a1a] text-white p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
                Official Public Safety Advisory · {cyclone.name}
              </h2>
              <p className="text-xs text-white/90">
                Landfall ETA: {cyclone.landfallEta} near {cyclone.landfallLocation}. Follow NDRF and local administration directives.
              </p>
            </div>
          </div>

          <a
            href="tel:1070"
            className="px-4 py-2.5 bg-white text-[#93000a] font-bold rounded-xl text-xs flex items-center gap-2 shadow hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4" />
            Toll-Free Helpline: 1070
          </a>
        </div>

        {/* Coastal District Safety Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {districts.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="bg-[#121a21] border border-[#263845] rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" /> {d.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                  {d.riskLevel}
                </span>
              </div>

              <div className="text-xs text-[#c0c7d1] space-y-1 pt-1 font-mono">
                <div>Wind Speed: <strong className="text-white">{d.peakWindKt} kt ({Math.round(d.peakWindKt * 1.852)} km/h)</strong></div>
                <div>Projected Surge: <strong className="text-amber-400">+{d.peakSurgeM} meters</strong></div>
                <div>Shelters Active: <strong className="text-emerald-400">{d.sheltersActive} / {d.sheltersTotal}</strong></div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Directives for Citizens */}
        <div className="bg-[#121a21] border border-[#263845] rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> What You Must Do Now:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#c0c7d1] leading-relaxed">
            <div className="p-3 rounded-lg bg-[#1b2831] border border-[#263845]">
              <strong className="text-white block mb-1">1. Move to Multipurpose Shelter</strong>
              If you reside within 5 km of the coast or in a kutcha house, evacuate immediately to the nearest concrete cyclone shelter.
            </div>

            <div className="p-3 rounded-lg bg-[#1b2831] border border-[#263845]">
              <strong className="text-white block mb-1">2. Keep Emergency Supplies Ready</strong>
              Store drinking water (3 days), non-perishable dry food, essential medicines, battery torches, and power banks.
            </div>

            <div className="p-3 rounded-lg bg-[#1b2831] border border-[#263845]">
              <strong className="text-white block mb-1">3. Fishermen Warning</strong>
              Strict ban on venturing into sea. Mechanized boats must remain securely berthed in safe creeks or harbors.
            </div>

            <div className="p-3 rounded-lg bg-[#1b2831] border border-[#263845]">
              <strong className="text-white block mb-1">4. Electrical Safety</strong>
              Disconnect electrical appliances before landfall to prevent electrocution and voltage surges.
            </div>
          </div>
        </div>

        {/* Citizen Disclaimer */}
        <div className="text-center text-[11px] text-[#8a919b] py-2">
          Public situational awareness feed generated by National Disaster Management Authority (NDMA) &amp; IMD RSMC New Delhi.
          Screening-level model, not an operational forecast.
        </div>
      </div>
    </div>
  );
};
