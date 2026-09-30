/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, ViewType } from './components/Header';
import { HomePage } from './components/HomePage';
import { AlertBanner } from './components/AlertBanner';
import { LayerRail, LayerState } from './components/LayerRail';
import { MapCanvas } from './components/MapCanvas';
import { StormStatusStrip } from './components/StormStatusStrip';
import { PriorityDistrictsCard } from './components/PriorityDistrictsCard';
import { TimelineScrubber } from './components/TimelineScrubber';
import { InspectorPanel } from './components/InspectorPanel';

// Modals
import { GeminiReasoningModal } from './components/GeminiReasoningModal';
import { AdvisoryApprovalModal } from './components/AdvisoryApprovalModal';
import { ScenarioLabModal } from './components/ScenarioLabModal';
import { ParametricInsuranceModal } from './components/ParametricInsuranceModal';
import { SitrepModal } from './components/SitrepModal';
import { TelemetryModal } from './components/TelemetryModal';
import { RiskModelModal } from './components/RiskModelModal';

// Seed Data
import { HISTORICAL_CYCLONES } from './data/cyclones';
import { INITIAL_DISTRICTS } from './data/districts';
import { CRITICAL_ASSETS, CASCADING_FAILURES } from './data/assets';
import { CycloneEvent, DistrictRisk } from './types/cyclone';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function App() {
  // Navigation View: starts on clean, intuitive 'home' portal
  const [activeView, setActiveView] = useState<ViewType>('home');

  // Cyclones and active storm
  const [cycloneList] = useState<CycloneEvent[]>(HISTORICAL_CYCLONES);
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneEvent>(HISTORICAL_CYCLONES[0]);

  // Track position (Default index is T-18h)
  const defaultIndex = selectedCyclone.track.findIndex((p) => p.timeOffsetHours === -18);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(defaultIndex !== -1 ? defaultIndex : 5);

  // Districts
  const [districts, setDistricts] = useState<DistrictRisk[]>(INITIAL_DISTRICTS);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRisk>(INITIAL_DISTRICTS[0]); // Puri

  // Assets and cascading risks
  const [criticalAssets] = useState(CRITICAL_ASSETS);
  const [cascadingFailures] = useState(CASCADING_FAILURES);

  // Layer Controls State
  const [layers, setLayers] = useState<LayerState>({
    stormTrackOpacity: 100,
    stormTrackVisible: true,
    hazardOpacity: 85,
    hazardVisible: true,
    exposureOpacity: 60,
    exposureVisible: true,
    populationOpacity: 40,
    populationVisible: false,
    showRadarOverlay: false,
    showSurgeOverlay: false,
    showHollandRings: true,
    showBathymetry: true,
    showCascadingLinks: true,
  });

  // UI Simplification: Ability to collapse left rail for clean focused map
  const [railCollapsed, setRailCollapsed] = useState(false);

  // Advisory Approval State
  const [isAdvisoryApproved, setIsAdvisoryApproved] = useState(false);
  const [approvedAuditHash, setApprovedAuditHash] = useState<string>('');

  // Modals Visibility
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isScenarioLabOpen, setIsScenarioLabOpen] = useState(false);
  const [isParametricModalOpen, setIsParametricModalOpen] = useState(false);
  const [isSitrepModalOpen, setIsSitrepModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isRiskModelModalOpen, setIsRiskModelModalOpen] = useState(false);

  // When cyclone changes, reset track index
  const handleSelectCyclone = useCallback((cyclone: CycloneEvent) => {
    setSelectedCyclone(cyclone);
    const idx = cyclone.track.findIndex((p) => p.timeOffsetHours === -18);
    setCurrentTrackIndex(idx !== -1 ? idx : 0);
  }, []);

  // Update layers helper
  const handleUpdateLayers = (updated: Partial<LayerState>) => {
    setLayers((prev) => ({ ...prev, ...updated }));
  };

  // Keyboard shortcuts (Ctrl+K opens Gemini AI, Esc closes modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGeminiModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsGeminiModalOpen(false);
        setIsApprovalModalOpen(false);
        setIsScenarioLabOpen(false);
        setIsParametricModalOpen(false);
        setIsSitrepModalOpen(false);
        setIsTelemetryModalOpen(false);
        setIsRiskModelModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active track points
  const currentPt = selectedCyclone.track[currentTrackIndex] || selectedCyclone.track[0];
  const previousPt = currentTrackIndex > 0 ? selectedCyclone.track[currentTrackIndex - 1] : undefined;

  // Dynamic sector metrics based on timeline
  const activeSectorMetrics = {
    evacuated: '342,120',
    evacuatedDelta: '+14% vs plan',
    sheltersActive: '894 / 920',
    shelterPct: '97% capacity',
  };

  return (
    <div className="bg-[#0b1220] text-[#dce2f6] h-screen flex flex-col overflow-hidden font-sans select-none">
      {/* 1. Top Navigation Bar */}
      <Header
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view === 'telemetry') setIsTelemetryModalOpen(true);
          else if (view === 'risk_modeling') setIsRiskModelModalOpen(true);
          else if (view === 'scenario_lab') setIsScenarioLabOpen(true);
          else if (view === 'parametric') setIsParametricModalOpen(true);
          else if (view === 'reports') setIsSitrepModalOpen(true);
        }}
        selectedCyclone={selectedCyclone}
        cycloneList={cycloneList}
        onSelectCyclone={handleSelectCyclone}
        onOpenGeminiAI={() => setIsGeminiModalOpen(true)}
        onOpenApproval={() => setIsApprovalModalOpen(true)}
      />

      {/* Main View Router */}
      {activeView === 'home' ? (
        /* Streamlined Mission Portal Landing Page */
        <HomePage
          cyclone={selectedCyclone}
          cycloneList={cycloneList}
          onSelectCyclone={handleSelectCyclone}
          districts={districts}
          criticalAssets={criticalAssets}
          onEnterCommandCenter={() => setActiveView('operations')}
          onOpenEvacuationModal={() => setIsApprovalModalOpen(true)}
          onOpenScenarioLab={() => setIsScenarioLabOpen(true)}
          onOpenGeminiAI={() => setIsGeminiModalOpen(true)}
          onOpenParametric={() => setIsParametricModalOpen(true)}
          onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
          onOpenSitrep={() => setIsSitrepModalOpen(true)}
          onOpenRiskModel={() => setIsRiskModelModalOpen(true)}
          onSelectDistrict={(d) => setSelectedDistrict(d)}
        />
      ) : (
        /* Tactical GIS Command Center View */
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Alert Banner Slot */}
          <AlertBanner
            onViewImpact={() => setIsRiskModelModalOpen(true)}
            onApproveAdvisory={() => setIsApprovalModalOpen(true)}
            isApproved={isAdvisoryApproved}
          />

          {/* Tactical Workspace */}
          <div className="flex flex-1 relative overflow-hidden">
            {/* Left Collapsible Layer Rail */}
            {!railCollapsed ? (
              <div className="relative flex">
                <LayerRail
                  layers={layers}
                  onChangeLayers={handleUpdateLayers}
                  onOpenModelCard={() => setIsRiskModelModalOpen(true)}
                />
                <button
                  onClick={() => setRailCollapsed(true)}
                  className="absolute -right-3 top-3 z-20 size-6 bg-[#1b2831] border border-[#364f63] text-[#8a919b] hover:text-white rounded-full flex items-center justify-center shadow transition-colors"
                  title="Collapse Layer Controls"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-2 z-20">
                <button
                  onClick={() => setRailCollapsed(false)}
                  className="p-2 bg-[#121a21] hover:bg-[#1b2831] border border-[#263845] text-[#92ccff] rounded-lg flex items-center gap-1.5 text-xs shadow transition-colors"
                  title="Expand Layer Controls"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Layers</span>
                </button>
              </div>
            )}

            {/* Central Tactical GIS Map View */}
            <div className="flex-1 relative flex flex-col bg-[#0c1321] overflow-hidden">
              {/* Central Map Canvas */}
              <MapCanvas
                cyclone={selectedCyclone}
                currentTrackPoint={currentPt}
                districts={districts}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(d) => setSelectedDistrict(d)}
                criticalAssets={criticalAssets}
                layers={layers}
              />

              {/* Top-Left Overlay: Storm Status Strip with Translational Speed metric */}
              <StormStatusStrip
                cyclone={selectedCyclone}
                currentTrackPoint={currentPt}
                previousTrackPoint={previousPt}
                onOpenHollandModel={() => setIsRiskModelModalOpen(true)}
              />

              {/* Top-Right Overlay: Top-5 Priority Districts */}
              <PriorityDistrictsCard
                districts={districts}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(d) => setSelectedDistrict(d)}
              />

              {/* Bottom Timeline Scrubber */}
              <TimelineScrubber
                trackPoints={selectedCyclone.track}
                currentTrackIndex={currentTrackIndex}
                onSelectTrackIndex={(idx) => setCurrentTrackIndex(idx)}
                landfallEta={selectedCyclone.landfallEta}
              />
            </div>

            {/* Right Inspector Panel */}
            <InspectorPanel
              selectedDistrict={selectedDistrict}
              activeSectorMetrics={activeSectorMetrics}
              cascadingFailures={cascadingFailures}
              criticalAssets={criticalAssets}
              onBroadcastEvacuation={() => setIsApprovalModalOpen(true)}
              onExportSitrep={() => setIsSitrepModalOpen(true)}
              onDispatchNdrf={() => {
                alert('NDRF Task Force deployed across Puri and coastal staging zones.');
              }}
              onOpenGeminiAI={() => setIsGeminiModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Persistent Modals (Accessible from both Home and Tactical views) */}
      <GeminiReasoningModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        selectedDistrict={selectedDistrict}
        cyclone={selectedCyclone}
      />

      <AdvisoryApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        selectedDistrict={selectedDistrict}
        cyclone={selectedCyclone}
        isAlreadyApproved={isAdvisoryApproved}
        onConfirmApproval={(hash) => {
          setIsAdvisoryApproved(true);
          setApprovedAuditHash(hash);
        }}
      />

      <ScenarioLabModal
        isOpen={isScenarioLabOpen}
        onClose={() => setIsScenarioLabOpen(false)}
        cyclone={selectedCyclone}
      />

      <ParametricInsuranceModal
        isOpen={isParametricModalOpen}
        onClose={() => setIsParametricModalOpen(false)}
        districts={districts}
        cyclone={selectedCyclone}
      />

      <SitrepModal
        isOpen={isSitrepModalOpen}
        onClose={() => setIsSitrepModalOpen(false)}
        cyclone={selectedCyclone}
        selectedDistrict={selectedDistrict}
        districts={districts}
        cascadingFailures={cascadingFailures}
      />

      <TelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
      />

      <RiskModelModal
        isOpen={isRiskModelModalOpen}
        onClose={() => setIsRiskModelModalOpen(false)}
      />
    </div>
  );
}
