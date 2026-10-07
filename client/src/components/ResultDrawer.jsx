import React from 'react';
import { ResultBadge, SeverityBadge, PersonalizationBadge } from './Badge';
import { X, Sparkles, Terminal, FileCode, CheckCircle2, AlertOctagon } from 'lucide-react';

export const ResultDrawer = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-[#0c1222] border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <ResultBadge result={result.result} />
            <SeverityBadge severity={result.severity} />
          </div>
          <h2 className="text-base font-bold text-white font-mono mt-2">{result.category} Assessment</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Why this test was selected (Section 17 & 41) */}
        <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why This Test Was Selected (Personalized)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {result.why_selected || 'Selected based on high customer data sensitivity and open chat vector exposure.'}
          </p>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
            Test Prompt (Attacking Vector)
          </label>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-words">
            {result.prompt}
          </div>
        </div>

        {/* Expected Behavior */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
            Expected Safe Behavior
          </label>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            {result.expected_behavior}
          </div>
        </div>

        {/* Actual Target Response */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
            Actual Target AI Response
          </label>
          <div className={`p-3 rounded-lg font-mono text-xs border break-words ${
            result.result === 'fail'
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}>
            {result.actual_response}
          </div>
        </div>

        {/* Evidence & Findings */}
        {result.evidence && (
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
              Evidence / Detection Proof
            </label>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
              {result.evidence}
            </div>
          </div>
        )}

        {/* Why it Matters & Recommendation */}
        <div>
          <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
            Remediation Recommendation
          </label>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-300">
            {result.recommendation || 'Continue routine adaptive screening.'}
          </div>
        </div>
      </div>
    </div>
  );
};
