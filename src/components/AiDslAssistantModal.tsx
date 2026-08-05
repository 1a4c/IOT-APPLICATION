import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { AiAnalysisResult, SystemTelemetry } from '../types';

interface AiDslAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  dslCode: string;
  setDslCode: (code: string) => void;
  telemetry: SystemTelemetry;
}

export const AiDslAssistantModal: React.FC<AiDslAssistantModalProps> = ({
  isOpen,
  onClose,
  dslCode,
  setDslCode,
  telemetry,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-dsl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dslCode,
          context: telemetry,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Server request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Gemini AI Analysis error:', err);
      setError(err?.message || 'Failed to connect to Gemini AI Server');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimizedDsl = () => {
    if (result?.optimizedDsl) {
      setDslCode(result.optimizedDsl);
      onClose();
    }
  };

  const handleCopyCode = () => {
    if (result?.optimizedDsl) {
      navigator.clipboard.writeText(result.optimizedDsl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-sans tracking-tight">
                Gemini AI Spatial IIoT DSL Optimizer
              </h3>
              <p className="text-xs text-slate-400">
                Server-side analysis of 4-layer BLE geofence & valve logic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Initial State / Analyze Button */}
          {!result && !loading && !error && (
            <div className="text-center py-8 space-y-4">
              <Bot className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-bold text-white text-base">
                  Ready to audit your IIoT DSL Script
                </h4>
                <p className="text-xs text-slate-400">
                  Gemini will inspect your 4-layer script for noise filtering efficiency, geofence edge cases, and valve safety interlocks.
                </p>
              </div>

              <button
                onClick={handleRunAnalysis}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center space-x-2 mx-auto shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Run Gemini AI Deep Audit</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-mono text-purple-300 font-bold">
                Analyzing 4-Layer IIoT Script AST with Gemini 3.6 Flash...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-2xl p-4 text-xs font-mono text-red-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Analysis Failed</span>
              </div>
              <p className="text-slate-300">{error}</p>
              <button
                onClick={handleRunAnalysis}
                className="mt-2 px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-semibold cursor-pointer"
              >
                Retry Audit
              </button>
            </div>
          )}

          {/* Result View */}
          {result && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-sans">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">
                  Executive Summary
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Engineering Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider block">
                    Engineering Recommendations
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optimized DSL Output */}
              {result.optimizedDsl && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Optimized DSL Code
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center space-x-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-900 text-cyan-300 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed">
                    {result.optimizedDsl}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {result && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            {result.optimizedDsl && (
              <button
                onClick={handleApplyOptimizedDsl}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Apply Optimized DSL Script</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
