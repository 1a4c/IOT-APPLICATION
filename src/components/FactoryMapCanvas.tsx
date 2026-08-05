import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Move,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Radio,
  Maximize2,
  Crosshair,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { BLEBeacon, SystemTelemetry } from '../types';
import { isPointInPolygon, rssiToMeters } from '../lib/dslParser';

interface FactoryMapCanvasProps {
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
  beacons: BLEBeacon[];
}

export const FactoryMapCanvas: React.FC<FactoryMapCanvasProps> = ({
  telemetry,
  setTelemetry,
  beacons,
}) => {
  const [isPatrolling, setIsPatrolling] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Target valve location on map (meters)
  const valveLoc = { x: 12.5, y: 7.5 };

  // Check geofence collision
  useEffect(() => {
    const inside = isPointInPolygon(
      telemetry.technicianPos,
      telemetry.affinePolySet.vertices
    );
    setTelemetry((prev) => ({
      ...prev,
      coreUiSuccessed: inside,
    }));
  }, [telemetry.technicianPos, telemetry.affinePolySet, setTelemetry]);

  // Patrol animation
  useEffect(() => {
    let interval: any;
    if (isPatrolling) {
      let t = 0;
      interval = setInterval(() => {
        t += 0.05;
        // Circular patrol path moving through geofence boundary
        const cx = 12.5;
        const cy = 8.0;
        const rx = 6.0;
        const ry = 4.5;
        const newX = Math.round((cx + rx * Math.cos(t)) * 10) / 10;
        const newY = Math.round((cy + ry * Math.sin(t)) * 10) / 10;

        setTelemetry((prev) => ({
          ...prev,
          technicianPos: { x: newX, y: newY },
        }));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPatrolling, setTelemetry]);

  // Handle Dragging Technician avatar
  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map pixel (0 to rect.width, 0 to rect.height) to floor meters (0 to 25m, 0 to 18m)
    const meterX = Math.min(Math.max((clickX / rect.width) * 25, 0), 25);
    const meterY = Math.min(Math.max((clickY / rect.height) * 18, 0), 18);

    setTelemetry((prev) => ({
      ...prev,
      technicianPos: {
        x: Math.round(meterX * 10) / 10,
        y: Math.round(meterY * 10) / 10,
      },
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Convert floor meters to SVG percentage string
  const mToPxX = (x: number) => `${(x / 25) * 100}%`;
  const mToPxY = (y: number) => `${(y / 18) * 100}%`;

  // Build affine polygon points string
  const polygonPointsStr = telemetry.affinePolySet.vertices
    .map((v) => `${(v.x / 25) * 100},${(v.y / 18) * 100}`)
    .join(' ');

  // Distance to target valve
  const dx = telemetry.technicianPos.x - valveLoc.x;
  const dy = telemetry.technicianPos.y - valveLoc.y;
  const distToValve = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sector Golf Floor Plan (25m × 18m)
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Affine Polygon Geofence (<code className="text-cyan-300">affine_set-poly</code>) & BLE Scanner Node Positioning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPatrolling(!isPatrolling)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
              isPatrolling
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30'
            }`}
          >
            {isPatrolling ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Patrol</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Auto Patrol Walk</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              setTelemetry((prev) => ({
                ...prev,
                technicianPos: { x: 12.5, y: 7.5 },
              }))
            }
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center at Valve</span>
          </button>
        </div>
      </div>

      {/* Main Floor Plan Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Map Interactive View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Drag node to test Geofence detection</span>
            </div>
            <span>Scale: 1m = 40px • Grid: 1m²</span>
          </div>

          {/* Interactive SVG Floor Grid */}
          <div
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full aspect-[25/18] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner cursor-crosshair select-none"
          >
            {/* Grid Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern
                  id="grid"
                  width="4%"
                  height="5.55%"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="rgba(51, 65, 85, 0.3)"
                    strokeWidth="0.5"
                  />
                </pattern>
                <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Affine Polygon Geofence (`affine_set-poly`) */}
              <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
                <polygon
                  points={polygonPointsStr}
                  fill="url(#polyGrad)"
                  stroke={telemetry.coreUiSuccessed ? '#22c55e' : '#06b6d4'}
                  strokeWidth="1.2"
                  strokeDasharray={telemetry.coreUiSuccessed ? '0' : '2,2'}
                  className="transition-all duration-300"
                />
              </svg>
            </svg>

            {/* Target Valve Node (`VALVE-ACTUATOR-B42`) */}
            <div
              style={{
                left: mToPxX(valveLoc.x),
                top: mToPxY(valveLoc.y),
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
            >
              <div className="w-9 h-9 rounded-full bg-cyan-950/90 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-cyan-300 font-bold border border-cyan-800 shadow">
                VALVE-B42 ({telemetry.nativeValveSecArc}°)
              </span>
            </div>

            {/* BLE Beacons on Floor */}
            {beacons.map((b) => (
              <div
                key={b.id}
                style={{
                  left: mToPxX(b.x),
                  top: mToPxY(b.y),
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-950/90 border border-indigo-400 text-indigo-300 flex items-center justify-center text-[10px] font-mono font-bold shadow">
                  <Radio className="w-3 h-3 text-indigo-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-1 rounded">
                  {b.name}
                </span>
              </div>
            ))}

            {/* Technician Scanner Node (`port_lux-blue`) */}
            <div
              style={{
                left: mToPxX(telemetry.technicianPos.x),
                top: mToPxY(telemetry.technicianPos.y),
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-transform cursor-grab active:cursor-grabbing"
            >
              {/* Coverage Ring */}
              <div className="w-20 h-20 rounded-full border border-emerald-500/30 bg-emerald-500/10 animate-ping absolute -inset-5 pointer-events-none" />

              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
                  telemetry.coreUiSuccessed
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/50'
                    : 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-amber-500/50'
                }`}
              >
                <Crosshair className="w-6 h-6 animate-spin" />
              </div>

              <div className="mt-1.5 bg-slate-900/95 border border-slate-700 rounded-lg px-2 py-1 text-center shadow-lg font-mono">
                <span className="block text-[10px] text-white font-bold">
                  port_lux-blue
                </span>
                <span className="block text-[9px] text-slate-400">
                  X:{telemetry.technicianPos.x}m Y:{telemetry.technicianPos.y}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry & Controls Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Geofence Detection Status Card */}
          <div
            className={`border rounded-2xl p-5 shadow-xl transition-all ${
              telemetry.coreUiSuccessed
                ? 'bg-emerald-950/40 border-emerald-700/80'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {telemetry.coreUiSuccessed ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400" />
              )}
              <h3 className="font-bold text-white text-base">
                {telemetry.coreUiSuccessed
                  ? 'core-ui-successed: ACTIVE'
                  : 'Out of Affine Geofence'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {telemetry.coreUiSuccessed
                ? 'Technician node is locked within the 4-vertex affine polygon geofence. AR overlays and valve control are authorized.'
                : 'Technician node is currently outside the target maintenance polygon. Move node closer to VALVE-B42.'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Distance to Valve:</span>
                <span className="text-cyan-300 font-bold">{distToValve}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fluid Gel Interlock:</span>
                <span
                  className={
                    telemetry.isGel ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  {telemetry.isGel ? 'PASSED (GELLED)' : 'WARNING (FLUID)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actuator Angle:</span>
                <span className="text-cyan-300 font-bold">
                  {telemetry.nativeValveSecArc}° Arc
                </span>
              </div>
            </div>
          </div>

          {/* Valve Actuator Arc Angle Adjuster */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">
                native_valve_sec-arc Control
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {telemetry.nativeValveSecArc}°
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={telemetry.nativeValveSecArc}
              onChange={(e) =>
                setTelemetry((prev) => ({
                  ...prev,
                  nativeValveSecArc: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0° (Closed)</span>
              <span>45° (Mid-Arc)</span>
              <span>90° (Full-Open)</span>
            </div>
          </div>

          {/* Polygon Vertex Coordinates Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              affine_set-poly Vertices
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {telemetry.affinePolySet.vertices.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80"
                >
                  <span className="text-slate-400">Vertex #{idx + 1}</span>
                  <span className="text-cyan-300">
                    X: {v.x}m, Y: {v.y}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
