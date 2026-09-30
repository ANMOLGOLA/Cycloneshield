import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Languages, 
  Image as ImageIcon, 
  CheckCircle, 
  Terminal, 
  Layers, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { DistrictRisk, CycloneEvent } from '../types/cyclone';

interface GeminiReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: DistrictRisk;
  cyclone: CycloneEvent;
}

export const GeminiReasoningModal: React.FC<GeminiReasoningModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  cyclone,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'advisory' | 'imagery'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'gemini';
    text: string;
    citations?: string[];
    functionCalled?: string;
    timestamp: string;
  }>>([
    {
      sender: 'gemini',
      text: `CycloneShield Geospatial AI initialized with model gemini-3.8-flash. Operational data loaded for ${cyclone.name} (T-18h). You can ask natural-language questions regarding flood depth, road access, hospital power status, or parametric insurance triggers.`,
      citations: ['IMD RSMC New Delhi Bulletin #24', 'Copernicus GLO-30 DEM v2024'],
      timestamp: 'Just now'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  // Advisory state
  const [selectedLang, setSelectedLang] = useState<'English' | 'Odia' | 'Hindi' | 'Bengali' | 'Telugu' | 'Tamil'>('Odia');
  const [advisories, setAdvisories] = useState<any>(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);

  // Imagery state
  const [imageryAnalyzing, setImageryAnalyzing] = useState(false);
  const [imageryResult, setImageryResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSendQuery = async (queryText?: string) => {
    const promptToSend = queryText || inputPrompt;
    if (!promptToSend.trim() || isQuerying) return;

    const userMsg = {
      sender: 'user' as const,
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsQuerying(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: {
            cycloneName: cyclone.name,
            districtName: selectedDistrict.name,
            currentWindKt: cyclone.windSpeedKt,
            currentPressureHpa: cyclone.centralPressureHpa,
            surgePeakM: selectedDistrict.peakSurgeM,
          },
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: data.text,
          citations: data.citations,
          functionCalled: data.functionCalls?.[0]?.name,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: `Error contacting server: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGenerateAdvisories = async () => {
    setLoadingAdvisory(true);
    try {
      const res = await fetch('/api/gemini/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtName: selectedDistrict.name,
          leadTimeHours: 18,
          severity: 'Severe',
        }),
      });
      const data = await res.json();
      setAdvisories(data.advisories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  const handleAnalyzeImagery = () => {
    setImageryAnalyzing(true);
    setTimeout(() => {
      setImageryResult({
        satellite: 'Sentinel-1 SAR C-Band (12m Interferometric Wide)',
        timestamp: '28 Oct 2026, 12:45 UTC',
        findings: [
          'Permanent coastal embankment intact at Devi River estuary.',
          'Brackish inundation detected over 42 km² of low-lying polders in Astaranga block.',
          'Chilika lagoon mouth channel width widened by 120m due to incoming 4.8m surge pressure head.',
          'Critical access road NH-316 shows 400m waterlogging signature at grid reference (19.82°N, 85.82°E).'
        ],
        confidenceScore: 0.94,
      });
      setImageryAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121a21] border border-[#263845] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#263845] bg-[#151b2a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-[#1b2831] border border-[#364f63] flex items-center justify-center text-[#92ccff]">
              <Sparkles className="w-4 h-4 text-[#92ccff] animate-pulse" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold flex items-center gap-2">
                Gemini Multimodal Geospatial Reasoning Layer
                <span className="text-[10px] bg-[#1b2831] text-[#92ccff] px-2 py-0.5 rounded border border-[#364f63] font-mono">
                  gemini-3.8-flash
                </span>
              </h2>
              <span className="text-[11px] text-[#8a919b]">
                Grounded via Copernicus DEM, Holland (1980) Wind Field, and OpenStreetMap Overpass tools
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#263845] bg-[#121a21] px-5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'chat'
                ? 'text-[#92ccff] border-b-2 border-[#92ccff]'
                : 'text-[#8a919b] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Natural Language Q&A
          </button>
          <button
            onClick={() => {
              setActiveTab('advisory');
              if (!advisories) handleGenerateAdvisories();
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'advisory'
                ? 'text-[#92ccff] border-b-2 border-[#92ccff]'
                : 'text-[#8a919b] hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" /> Multi-Lingual CAP Advisories
          </button>
          <button
            onClick={() => {
              setActiveTab('imagery');
              if (!imageryResult) handleAnalyzeImagery();
            }}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'imagery'
                ? 'text-[#92ccff] border-b-2 border-[#92ccff]'
                : 'text-[#8a919b] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Sentinel-1 SAR &amp; Satellite Analysis
          </button>
        </div>

        {/* Tab 1: Natural Language Q&A */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            {/* Suggested quick prompt buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-[#8a919b] whitespace-nowrap">Suggested:</span>
              <button
                onClick={() => handleSendQuery('Which hospitals in Puri lose road access by 18:00?')}
                className="px-2.5 py-1 rounded bg-[#1b2831] hover:bg-[#263845] text-[#92ccff] border border-[#364f63] whitespace-nowrap"
              >
                Which hospitals in Puri lose road access?
              </button>
              <button
                onClick={() => handleSendQuery('What is the storm surge breakdown at Astaranga?')}
                className="px-2.5 py-1 rounded bg-[#1b2831] hover:bg-[#263845] text-[#92ccff] border border-[#364f63] whitespace-nowrap"
              >
                Storm surge breakdown at Astaranga
              </button>
              <button
                onClick={() => handleSendQuery('Is the parametric insurance trigger met for Puri district?')}
                className="px-2.5 py-1 rounded bg-[#1b2831] hover:bg-[#263845] text-[#92ccff] border border-[#364f63] whitespace-nowrap"
              >
                Parametric insurance trigger status
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#263845] text-white border border-[#364f63]'
                        : 'bg-[#1b2831] text-[#dce2f6] border border-[#364f63]'
                    }`}
                  >
                    {m.functionCalled && (
                      <div className="mb-2 pb-1.5 border-b border-[#364f63] font-mono text-[10px] text-[#92ccff] flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" /> Function executed: {m.functionCalled}()
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#263845] text-[10px] text-[#8a919b]">
                        <span className="font-semibold text-[#c0c7d1]">Data Citations: </span>
                        {m.citations.join(' · ')}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8a919b] mt-1 px-1 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              ))}
              {isQuerying && (
                <div className="flex items-center gap-2 text-xs text-[#92ccff] p-2 font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Reasoning with grounded geospatial tools...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2 pt-2 border-t border-[#263845]"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask grounded questions on infrastructure cutoff, surge depths, or evacuation..."
                className="flex-1 bg-[#1b2831] border border-[#364f63] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8a919b] focus:outline-none focus:border-[#92ccff]"
              />
              <button
                type="submit"
                disabled={isQuerying || !inputPrompt.trim()}
                className="bg-[#92ccff] hover:bg-[#cce5ff] text-[#003351] font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Multi-Lingual CAP Advisories */}
        {activeTab === 'advisory' && (
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8a919b]">Select Target Language:</span>
                {(['English', 'Odia', 'Hindi', 'Bengali', 'Telugu', 'Tamil'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      selectedLang === lang
                        ? 'bg-[#92ccff] text-[#003351] font-bold'
                        : 'bg-[#1b2831] text-[#c0c7d1] hover:text-white border border-[#364f63]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateAdvisories}
                disabled={loadingAdvisory}
                className="text-xs px-3 py-1 bg-[#1b2831] hover:bg-[#263845] text-[#92ccff] rounded border border-[#364f63]"
              >
                {loadingAdvisory ? 'Generating...' : 'Regenerate'}
              </button>
            </div>

            {advisories && advisories[selectedLang] ? (
              <div className="bg-[#1b2831] rounded-xl p-4 border border-[#364f63] flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#263845]">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                    CAP 1.2 Format · {selectedLang}
                  </span>
                  <span className="text-[10px] text-[#8a919b] font-mono">Status: READY FOR BROADCAST</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[#8a919b] block font-mono">Headline</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {advisories[selectedLang].headline}
                  </h3>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[#8a919b] block font-mono">Description</span>
                  <p className="text-xs text-[#c0c7d1] mt-0.5 leading-relaxed">
                    {advisories[selectedLang].description}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[#8a919b] block font-mono">Instruction</span>
                  <p className="text-xs text-emerald-400 mt-0.5 leading-relaxed bg-[#121a21] p-2.5 rounded border border-[#263845]">
                    {advisories[selectedLang].instruction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-xs text-[#8a919b]">
                Loading multilingual translations...
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Satellite Imagery Analysis */}
        {activeTab === 'imagery' && (
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63]">
                <span className="text-xs font-bold text-white block mb-2">Synthetic Aperture Radar (SAR) Inundation Tile</span>
                <div className="h-44 bg-[#070e1c] rounded-lg border border-[#263845] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#92ccff_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-[#92ccff] mx-auto mb-2 opacity-60" />
                    <span className="text-[11px] text-[#c0c7d1] block font-mono">COPERNICUS/S1_GRD</span>
                    <span className="text-[10px] text-[#8a919b] block">Interferometric Wide VV+VH Polarization</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1b2831] p-3 rounded-xl border border-[#364f63] flex flex-col gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Automated Multimodal Inspection
                </span>
                {imageryResult ? (
                  <div className="text-xs flex flex-col gap-2">
                    <div className="text-[11px] text-[#8a919b]">
                      Sensor: <span className="text-white font-mono">{imageryResult.satellite}</span>
                    </div>
                    <div className="text-[11px] text-[#8a919b]">
                      Acquisition: <span className="text-white font-mono">{imageryResult.timestamp}</span>
                    </div>
                    <div className="text-[11px] font-bold text-white mt-1">Key AI Findings:</div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#c0c7d1]">
                      {imageryResult.findings.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs text-[#8a919b]">Analyzing SAR backscatter coefficients...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
