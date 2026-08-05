import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sliders,
  Zap,
  Info,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { SystemTelemetry } from '../types';
import { applyBinomialReservoirFilter } from '../lib/dslParser';

interface SignalReservoirChartProps {
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
}

export const SignalReservoirChart: React.FC<SignalReservoirChartProps> = ({
  telemetry,
  setTelemetry,
}) => {
  const [history, setHistory] = useState<
    Array<{ time: number; raw: number; filtered: number }>
  >([]);

  // Periodically generate noisy RSSI samples and compute binomial reservoir output
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        // Base distance RSSI around -65 dBm
        const baseRssi = -65;
        // Add random gaussian noise based on telemetry.noiseLevel
        const noise = (Math.random() - 0.5) * telemetry.noiseLevel * 2;
        const currentRaw = Math.round(baseRssi + noise);

        const rawList = prev.map((item) => item.raw).concat(currentRaw);
        const filteredRssi = applyBinomialReservoirFilter(
          rawList,
          telemetry.reservoirSize,
          telemetry.binomialBeta
        );

        const next = prev.concat({
          time: Date.now(),
          raw: currentRaw,
          filtered: filteredRssi,
        });

        // Keep last 30 samples
        return next.slice(-30);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [telemetry.noiseLevel, telemetry.reservoirSize, telemetry.binomialBeta]);

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 700;

  // Map RSSI (-90 dBm to -40 dBm) to SVG Y coordinate (chartHeight to 0)
  const rssiToY = (rssi: number) => {
    const minRssi = -90;
    const maxRssi = -40;
    const clamped = Math.max(minRssi, Math.min(maxRssi, rssi));
    return chartHeight - ((clamped - minRssi) / (maxRssi - minRssi)) * chartHeight;
  };

  const rawPolyline = history
    .map((item, idx) => {
      const x = (idx / Math.max(history.length - 1, 1)) * chartWidth;
      const y = rssiToY(item.raw);
      return `${x},${y}`;
    })
    .join(' ');

  const filteredPolyline = history
    .map((item, idx) => {
      const x = (idx / Math.max(history.length - 1, 1)) * chartWidth;
      const y = rssiToY(item.filtered);
      return `${x},${y}`;
    })
    .join(' ');

  const latestRaw = history[history.length - 1]?.raw || -65;
  const latestFiltered = history[history.length - 1]?.filtered || -65;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Binomial RSSI Signal Reservoir (<code className="text-amber-300">1::usage_asset.binomial_resevoir</code>)
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Statistical sliding window sampling eliminates high-frequency multipath noise in industrial BLE beacon tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-slate-400">Raw RSSI:</span>
            <span className="text-red-400 font-bold">{latestRaw} dBm</span>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Filtered:</span>
            <span className="text-cyan-400 font-bold">{latestFiltered} dBm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Real-time Waveform SVG Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Live RSSI Time Series (Last 30 Samples)</span>
            <span>Threshold Gate: -75 dBm</span>
          </div>

          <div className="relative w-full aspect-[20/9] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-4 shadow-inner">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
            >
              {/* Grid Background Lines */}
              {[-80, -70, -60, -50].map((level) => {
                const y = rssiToY(level);
                return (
                  <g key={level}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                    <text
                      x="5"
                      y={y - 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {level} dBm
                    </text>
                  </g>
                );
              })}

              {/* Threshold Gate Line */}
              <line
                x1="0"
                y1={rssiToY(-75)}
                x2={chartWidth}
                y2={rssiToY(-75)}
                stroke="#eab308"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />

              {/* Raw Noisy RSSI Path (Red Line) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeOpacity="0.8"
                points={rawPolyline}
              />

              {/* Binomial Filtered RSSI Path (Cyan Line) */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                points={filteredPolyline}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-0.5 bg-red-500 rounded" />
              <span>Unfiltered Jitter Signal</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-1 bg-cyan-400 rounded" />
              <span>Binomial Reservoir Smooth Output</span>
            </div>
          </div>
        </div>

        {/* Right Controls Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reservoir Parameter Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Reservoir Tuning Parameters
              </h3>
            </div>

            {/* Window Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Window Size (N):</span>
                <span className="text-cyan-300 font-bold">
                  {telemetry.reservoirSize} samples
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={telemetry.reservoirSize}
                onChange={(e) =>
                  setTelemetry((prev) => ({
                    ...prev,
                    reservoirSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Binomial Beta Weight Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Beta Factor (β):</span>
                <span className="text-cyan-300 font-bold">
                  {telemetry.binomialBeta}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={telemetry.binomialBeta}
                onChange={(e) =>
                  setTelemetry((prev) => ({
                    ...prev,
                    binomialBeta: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Simulated Noise Injector Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Injected Noise Jitter:</span>
                <span className="text-red-400 font-bold">
                  ±{telemetry.noiseLevel} dBm
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={telemetry.noiseLevel}
                onChange={(e) =>
                  setTelemetry((prev) => ({
                    ...prev,
                    noiseLevel: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          {/* Mathematical Explanation Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2 font-sans text-xs">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Info className="w-4 h-4" />
              <span>Statistical Reservoir Mechanism</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Industrial environments experience signal reflection from metallic structures and machinery. The Binomial Reservoir uses polynomial weighting to smooth out sharp RSSI dips without introducing phase delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
