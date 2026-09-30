import React, { useState } from 'react';
import { 
  Shield, 
  Home,
  Map,
  Radio, 
  Bell, 
  Settings, 
  Sparkles, 
  History, 
  Clock, 
  Sliders, 
  DollarSign, 
  FileText, 
  Activity, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { CycloneEvent } from '../types/cyclone';

export type ViewType = 'home' | 'operations' | 'telemetry' | 'risk_modeling' | 'scenario_lab' | 'parametric' | 'reports';

interface HeaderProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedCyclone: CycloneEvent;
  cycloneList: CycloneEvent[];
  onSelectCyclone: (c: CycloneEvent) => void;
  onOpenGeminiAI: () => void;
  onOpenApproval: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  selectedCyclone,
  cycloneList,
  onSelectCyclone,
  onOpenGeminiAI,
  onOpenApproval,
}) => {
  const [useIstTime, setUseIstTime] = useState(false);
  const [showCycloneDropdown, setShowCycloneDropdown] = useState(false);

  // Time formatter
  const currentTimeDisplay = useIstTime ? 'IST 09:01 (UTC+5:30)' : 'UTC 03:31 (ZULU)';

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-[#263845] bg-[#121a21] px-4 lg:px-6 py-2.5 z-30 select-none">
      {/* Brand & Subtitle (Clicking navigates to Home) */}
      <div className="flex items-center gap-4 text-white">
        <div 
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Mission Portal Home"
        >
          <div className="size-8 text-[#92ccff] flex items-center justify-center bg-[#1b2831] rounded-lg border border-[#364f63] group-hover:border-[#92ccff] transition-colors shadow">
            <Shield className="w-5 h-5 text-[#92ccff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-base font-bold tracking-tight group-hover:text-[#92ccff] transition-colors">
                CycloneShield
              </h1>
              <span className="text-[#92ccff] font-normal text-xs px-2 py-0.5 rounded bg-[#1b2831] border border-[#364f63] hidden sm:inline-block">
                Bay of Bengal
              </span>
            </div>
          </div>
        </div>

        {/* Replay / Cyclone Selector */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowCycloneDropdown(!showCycloneDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[#1b2831] border border-[#364f63] text-[#c0c7d1] hover:text-white transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#92ccff]" />
            <span className="font-semibold text-white">{selectedCyclone.name}</span>
            <span className="text-[10px] text-[#8a919b]">({selectedCyclone.year})</span>
            <ChevronDown className="w-3 h-3 text-[#8a919b]" />
          </button>

          {showCycloneDropdown && (
            <div className="absolute left-0 mt-1 w-64 bg-[#121a21] border border-[#364f63] rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-[#263845] text-[10px] uppercase font-bold text-[#8a919b]">
                Select Storm Scenario
              </div>
              {cycloneList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCyclone(c);
                    setShowCycloneDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#1b2831] transition-colors ${
                    c.id === selectedCyclone.id ? 'bg-[#1b2831] text-white font-bold' : 'text-[#c0c7d1]'
                  }`}
                >
                  <div>
                    <div className="text-xs">{c.name}</div>
                    <div className="text-[10px] text-[#8a919b]">{c.category} · {c.landfallLocation}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#263845] text-[#92ccff]">
                    {c.year}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation tabs (Clean & Simplified) */}
      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-1">
          {/* Home Tab */}
          <button
            onClick={() => setActiveView('home')}
            className={`px-3 py-1 text-sm font-semibold transition-colors flex items-center gap-1.5 rounded-lg ${
              activeView === 'home'
                ? 'bg-[#1b2831] text-white border border-[#364f63] shadow-sm'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-[#92ccff]" />
            <span>Home</span>
          </button>

          {/* Tactical Command Center Tab */}
          <button
            onClick={() => setActiveView('operations')}
            className={`px-3 py-1 text-sm font-semibold transition-colors flex items-center gap-1.5 rounded-lg ${
              activeView === 'operations'
                ? 'bg-[#1b2831] text-white border border-[#364f63] shadow-sm'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <Map className="w-4 h-4 text-[#92ccff]" />
            <span>Command Center</span>
          </button>

          {/* Scenario Lab Tab */}
          <button
            onClick={() => setActiveView('scenario_lab')}
            className={`px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1.5 rounded-lg hidden md:flex ${
              activeView === 'scenario_lab'
                ? 'bg-[#1b2831] text-white border border-[#364f63]'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Scenario Lab</span>
          </button>

          {/* Parametric Insurance Tab */}
          <button
            onClick={() => setActiveView('parametric')}
            className={`px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1.5 rounded-lg hidden lg:flex ${
              activeView === 'parametric'
                ? 'bg-[#1b2831] text-white border border-[#364f63]'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Parametric Payouts</span>
          </button>

          {/* Telemetry Tab */}
          <button
            onClick={() => setActiveView('telemetry')}
            className={`px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1.5 rounded-lg hidden lg:flex ${
              activeView === 'telemetry'
                ? 'bg-[#1b2831] text-white border border-[#364f63]'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-[#92ccff]" />
            <span>Telemetry</span>
          </button>

          {/* Reports Tab */}
          <button
            onClick={() => setActiveView('reports')}
            className={`px-3 py-1 text-sm font-medium transition-colors flex items-center gap-1.5 rounded-lg hidden sm:flex ${
              activeView === 'reports'
                ? 'bg-[#1b2831] text-white border border-[#364f63]'
                : 'text-[#c0c7d1] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8a919b]" />
            <span>Reports</span>
          </button>
        </nav>

        {/* Right utility items */}
        <div className="flex items-center gap-3">
          {/* Gemini AI Assistant Button */}
          <button
            onClick={onOpenGeminiAI}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#1b2831] to-[#263845] hover:to-[#364f63] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#364f63] text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#92ccff] animate-pulse" />
            <span>Gemini AI</span>
          </button>

          {/* Clock & UTC/IST toggle */}
          <button
            onClick={() => setUseIstTime(!useIstTime)}
            className="hidden sm:flex items-center gap-1.5 bg-[#1b2831] px-2.5 py-1 rounded-lg border border-[#364f63] text-[11px] font-mono text-[#c0c7d1] hover:text-white"
            title="Click to toggle UTC / IST"
          >
            <Clock className="w-3 h-3 text-[#92ccff]" />
            <span>{currentTimeDisplay}</span>
          </button>

          {/* Live Feed indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1b2831] px-3 py-1 rounded-lg border border-[#364f63]">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-mono text-xs text-white">SAT-7 LIVE</span>
          </div>

          {/* Alert Notification */}
          <button 
            onClick={onOpenApproval}
            className="relative flex items-center justify-center rounded-lg h-9 w-9 bg-[#263845] text-white hover:bg-[#364f63] transition-colors"
            title="Evacuation Orders Pending Approval"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="absolute -top-1 -right-1 size-3 bg-[#ffb4ab] rounded-full border-2 border-[#121a21]"></span>
          </button>

          {/* Settings */}
          <button 
            onClick={() => setActiveView('scenario_lab')}
            className="flex items-center justify-center rounded-lg h-9 w-9 bg-[#263845] text-white hover:bg-[#364f63] transition-colors"
            title="Simulation Parameters"
          >
            <Settings className="w-4 h-4 text-[#c0c7d1]" />
          </button>
        </div>
      </div>
    </header>
  );
};
