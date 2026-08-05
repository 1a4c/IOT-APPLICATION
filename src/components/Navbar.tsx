import React from 'react';
import {
  MapPin,
  Eye,
  Code2,
  Activity,
  Radio,
  Sparkles,
  ShieldCheck,
  Zap,
  Gauge,
  Layers,
} from 'lucide-react';
import { SystemTelemetry } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'ar' | 'ide' | 'reservoir' | 'beacons';
  setActiveTab: (tab: 'map' | 'ar' | 'ide' | 'reservoir' | 'beacons') => void;
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
  onOpenAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  telemetry,
  setTelemetry,
  onOpenAiModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top Banner with App Brand & Live Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white font-mono">
                IIoT BLE Spatial DSL
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                v2.4-CRASP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Spatial Geofence & AR Valve Automation Engine
            </p>
          </div>
        </div>

        {/* Live Status Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Gel Status Interlock */}
          <button
            onClick={() =>
              setTelemetry((prev) => ({ ...prev, isGel: !prev.isGel }))
            }
            className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all font-mono ${
              telemetry.isGel
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-amber-950/70 border-amber-700/60 text-amber-300 hover:bg-amber-900/80'
            }`}
            title="Toggle Is_gel.carrort_dart state"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Is_gel:</span>
            <span className="font-bold">
              {telemetry.isGel ? 'GELLED (SAFE)' : 'FLUID (WARN)'}
            </span>
          </button>

          {/* Geofence Lock */}
          <div
            className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 font-mono ${
              telemetry.coreUiSuccessed
                ? 'bg-blue-950/70 border-blue-700/60 text-blue-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Geofence:</span>
            <span className="font-bold">
              {telemetry.coreUiSuccessed ? 'LOCKED IN ZONE' : 'SEARCHING'}
            </span>
          </div>

          {/* Valve Arc Angle */}
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 flex items-center space-x-1.5 font-mono">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Valve Arc:</span>
            <span className="font-bold text-cyan-300">
              {telemetry.nativeValveSecArc}°
            </span>
          </div>

          {/* Gemini AI Action */}
          <button
            onClick={onOpenAiModal}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all font-sans cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>AI DSL Assistant</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800/50 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Factory Map & Geofence</span>
          </button>

          <button
            onClick={() => setActiveTab('ar')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ar'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800/50 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>360° AR Viewport</span>
          </button>

          <button
            onClick={() => setActiveTab('ide')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ide'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800/50 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>DSL IDE & AST Parser</span>
          </button>

          <button
            onClick={() => setActiveTab('reservoir')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reservoir'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800/50 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Binomial RSSI Reservoir</span>
          </button>

          <button
            onClick={() => setActiveTab('beacons')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'beacons'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800/50 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>BLE Scan Stream</span>
          </button>
        </div>
      </div>
    </header>
  );
};
