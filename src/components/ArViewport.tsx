import React, { useState } from 'react';
import {
  Eye,
  Crosshair,
  Gauge,
  Lock,
  Unlock,
  ShieldAlert,
  Camera,
  RotateCw,
  Sparkles,
  Layers,
  Thermometer,
  Zap,
} from 'lucide-react';
import { SystemTelemetry } from '../types';

interface ArViewportProps {
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
}

export const ArViewport: React.FC<ArViewportProps> = ({
  telemetry,
  setTelemetry,
}) => {
  const [snapshotSaved, setSnapshotSaved] = useState<boolean>(false);
  const [arDepthMode, setArDepthMode] = useState<'inverse_rssi' | 'direct_lidar'>('inverse_rssi');

  const handleCaptureSnapshot = () => {
    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2500);
  };

  // Calculate simulated line pressure PSI based on valve arc angle and gel status
  const estimatedPsi = Math.round(
    120 - (telemetry.nativeValveSecArc / 90) * 85 + (telemetry.isGel ? 15 : 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Eye className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              360° AR Spatial Viewport (<code className="text-cyan-300">screened_pararoma()</code>)
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Inverse RSSI Spatial Depth Logic (<code className="text-cyan-300">AR_inversed-logic</code>) over target location <code className="text-yellow-300">{telemetry.criticalStaringLocationId}</code>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCaptureSnapshot}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer shadow"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>{snapshotSaved ? 'Snapshot Saved!' : 'AR HUD Capture'}</span>
          </button>

          <button
            onClick={() =>
              setTelemetry((prev) => ({
                ...prev,
                screenedPanoramaActive: !prev.screenedPanoramaActive,
              }))
            }
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              telemetry.screenedPanoramaActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>
              Panorama Overlay:{' '}
              {telemetry.screenedPanoramaActive ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Main AR Camera Screen Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AR Camera Container */}
        <div className="lg:col-span-8 bg-slate-950 border-2 border-cyan-800/80 rounded-2xl overflow-hidden shadow-2xl relative aspect-[16/10] flex flex-col justify-between p-6 select-none">
          {/* Simulated Industrial Environment Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90" />

          {/* 3D Perspective Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 80%), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            }}
          />

          {/* AR HUD Overlay Top Bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-xs text-cyan-300 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-cyan-800/60 shadow">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white">
                HUD: {telemetry.criticalStaringLocationId}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span>DEPTH: INVERSE-RSSI</span>
              <span>
                FPS: <strong className="text-emerald-400">60.0</strong>
              </span>
              <span>
                BLE LATENCY: <strong className="text-cyan-400">12ms</strong>
              </span>
            </div>
          </div>

          {/* Center AR Reticle & 3D Valve Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
            {/* Target Reticle Crosshair */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Distance Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/50" />
              <div className="absolute inset-8 rounded-full border border-cyan-400/20" />

              <Crosshair className="w-12 h-12 text-cyan-400 animate-pulse" />

              {/* Animated Valve Actuator Model */}
              <div
                style={{
                  transform: `rotate(${telemetry.nativeValveSecArc}deg)`,
                }}
                className="w-28 h-28 rounded-full border-4 border-cyan-400/80 flex items-center justify-center transition-transform duration-500 shadow-lg shadow-cyan-500/20"
              >
                <div className="w-20 h-2 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow" />
              </div>
            </div>

            {/* AR Floating Data Label Card */}
            <div className="mt-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/60 rounded-xl px-4 py-3 shadow-2xl text-center space-y-1 font-mono">
              <span className="text-xs text-cyan-300 font-bold block">
                ACTUATOR SECTOR ARC: {telemetry.nativeValveSecArc}°
              </span>
              <div className="flex items-center justify-center space-x-3 text-[11px] text-slate-300">
                <span>EST PRESSURE: {estimatedPsi} PSI</span>
                <span>•</span>
                <span
                  className={
                    telemetry.isGel ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  GEL: {telemetry.isGel ? 'PASSED' : 'FLUID'}
                </span>
              </div>
            </div>
          </div>

          {/* AR HUD Bottom Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-cyan-800/60 text-slate-300 shadow">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>AR_inversed-logic Matrix: ACTIVE</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-slate-400">UUID:</span>
              <span className="text-cyan-300 font-bold">
                {telemetry.spottedSearchCrasp}
              </span>
            </div>
          </div>
        </div>

        {/* Right AR Controls & System Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Lock Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Target Anchor Locking
              </h3>
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Anchor Location:</span>
                <span className="text-yellow-300 font-bold">
                  {telemetry.criticalStaringLocationId}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">AR Render Mode:</span>
                <span className="text-cyan-300 font-bold">
                  {arDepthMode === 'inverse_rssi' ? 'Inversed RSSI' : 'Direct LiDAR'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() =>
                  setArDepthMode(
                    arDepthMode === 'inverse_rssi' ? 'direct_lidar' : 'inverse_rssi'
                  )
                }
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                Switch Depth Mode
              </button>
            </div>
          </div>

          {/* Actuator Arc Adjuster Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Quick Valve Arc Step Controls
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setTelemetry((prev) => ({ ...prev, nativeValveSecArc: 0 }))
                }
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                0° (Close)
              </button>
              <button
                onClick={() =>
                  setTelemetry((prev) => ({ ...prev, nativeValveSecArc: 45 }))
                }
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                45° (Mid)
              </button>
              <button
                onClick={() =>
                  setTelemetry((prev) => ({ ...prev, nativeValveSecArc: 90 }))
                }
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 font-mono text-xs border border-slate-800 transition-colors cursor-pointer"
              >
                90° (Open)
              </button>
            </div>
          </div>

          {/* Fluid Viscosity Interlock Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">
                Is_gel.carrort_dart Interlock
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  telemetry.isGel ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {telemetry.isGel ? 'Gelled System' : 'Fluid Liquid'}
              </span>
            </div>

            <button
              onClick={() =>
                setTelemetry((prev) => ({ ...prev, isGel: !prev.isGel }))
              }
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                telemetry.isGel
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900'
              }`}
            >
              Toggle Gel Physical State ({telemetry.isGel ? 'Gelled' : 'Liquid'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
