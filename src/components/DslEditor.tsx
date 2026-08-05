import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { DSL_PRESETS, parseDSLScript } from '../lib/dslParser';
import { DSLParsedToken, SystemTelemetry } from '../types';

interface DslEditorProps {
  dslCode: string;
  setDslCode: (code: string) => void;
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
  onOpenAiModal: () => void;
}

export const DslEditor: React.FC<DslEditorProps> = ({
  dslCode,
  setDslCode,
  telemetry,
  setTelemetry,
  onOpenAiModal,
}) => {
  const [parsedTokens, setParsedTokens] = useState<DSLParsedToken[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('valve_maintenance');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  useEffect(() => {
    const tokens = parseDSLScript(dslCode, telemetry);
    setParsedTokens(tokens);
  }, [dslCode, telemetry]);

  const handleSelectPreset = (presetId: string) => {
    const preset = DSL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setDslCode(preset.code);
      setTelemetry((prev) => ({
        ...prev,
        isGel: preset.defaultGelState,
        nativeValveSecArc: preset.presetArc,
      }));
    }
  };

  const filteredTokens = parsedTokens.filter(
    (t) => selectedLayer === 'all' || t.layer === selectedLayer
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Industrial IIoT DSL Engine & AST Evaluator
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Custom Domain-Specific Language for Spatial Geofencing, Signal Reservoir Statistics, and Valve Actuation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSelectPreset('valve_maintenance')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Default DSL</span>
            </button>

            <button
              onClick={onOpenAiModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg shadow-indigo-900/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>Ask Gemini to Optimize</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {DSL_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPreset === p.id
                  ? 'bg-cyan-950/60 border-cyan-500/80 ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 font-mono">
                <span>{p.name}</span>
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Code Editor & Parsed AST Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  SCRIPT_RUNNER.dsl
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                UTF-8 • IIoT-Syntax
              </span>
            </div>

            <div className="relative mt-3 font-mono text-xs">
              <textarea
                value={dslCode}
                onChange={(e) => setDslCode(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full bg-slate-950 text-cyan-300 p-4 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono leading-relaxed resize-none shadow-inner"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 font-mono">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>{dslCode.split('\n').length} Lines Executed</span>
            </div>
            <span className="text-emerald-400 font-mono font-semibold">
              Parser Engine: ACTIVE
            </span>
          </div>
        </div>

        {/* Right Column: AST Layer Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                4-Layer Evaluated Pipeline
              </h3>
            </div>

            {/* Layer Filter Pills */}
            <div className="flex items-center space-x-1 text-[11px] font-medium bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedLayer('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLayer === 'all'
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (100%)
              </button>
              <button
                onClick={() => setSelectedLayer('environment')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLayer === 'environment'
                    ? 'bg-slate-800 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Environment
              </button>
              <button
                onClick={() => setSelectedLayer('spatial')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLayer === 'spatial'
                    ? 'bg-slate-800 text-blue-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Spatial
              </button>
              <button
                onClick={() => setSelectedLayer('data')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLayer === 'data'
                    ? 'bg-slate-800 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Reservoir
              </button>
              <button
                onClick={() => setSelectedLayer('discovery')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLayer === 'discovery'
                    ? 'bg-slate-800 text-purple-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4. AR / Discovery
              </button>
            </div>
          </div>

          {/* Parsed Tokens List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredTokens.map((token, index) => {
              const layerBadges = {
                environment: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                spatial: 'bg-blue-950 text-blue-300 border-blue-800',
                data: 'bg-amber-950 text-amber-300 border-amber-800',
                discovery: 'bg-purple-950 text-purple-300 border-purple-800',
              };

              return (
                <div
                  key={token.id}
                  className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 transition-all space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold">
                        #{index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {token.rawText}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          layerBadges[token.layer]
                        }`}
                      >
                        {token.layer}
                      </span>

                      {token.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">
                    {token.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {token.explanation}
                  </p>

                  {token.value !== undefined && (
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Evaluated Value:</span>
                      <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {String(token.value)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
