import React from 'react';
import { Card } from '../components/Card';
import { PersonalizationBadge } from '../components/Badge';
import { ShieldCheck, AlertTriangle, Eye, Lock, FileWarning } from 'lucide-react';

export const SecurityPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-mono text-white">Responsible AI, Ethics & Security Disclaimer</h1>
          <PersonalizationBadge label="Transparency" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Guiding ethical standards, data handling principles, and platform boundaries for AI TrustGuard.
        </p>
      </div>

      {/* Mandatory Notice (Section 72) */}
      <div className="cyber-card p-6 border-amber-500/40 bg-amber-950/20 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>IMPORTANT PLATFORM RESPONSIBILITY NOTICE</span>
        </div>
        <div className="font-sans text-xs text-slate-200 leading-relaxed space-y-2">
          <p>
            AI TrustGuard is an <strong>automated assessment and continuous red-teaming platform</strong>. Passing evaluations indicates resilience against specific tested vectors, but <strong>does NOT guarantee that an AI system is 100% secure, unhackable, private, or completely unbiased</strong>.
          </p>
          <p>
            Failing evaluations highlight specific behavioral weaknesses that require immediate security investigation and architectural hardening.
          </p>
        </div>
      </div>

      {/* Synthetic Information Protocol */}
      <Card title="Synthetic Data Policy (Zero-Real-PII Guarantee)">
        <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            AI TrustGuard strictly operates on <strong>synthetic mock data</strong> for all red-team evaluations, jailbreak payloads, and PII extraction tests.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300">
            <strong>Warning to Operators:</strong> Do not submit real passwords, live API tokens, actual government IDs, medical records, or genuine personal information into test suites or playground prompts.
          </div>
        </div>
      </Card>

      {/* Evaluation Methodology & Fairness Screening */}
      <Card title="Evaluation Methodology & Fairness Screening">
        <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            In accordance with industry best practices, all fairness and demographic bias screenings represent <strong>controlled heuristic screenings</strong> rather than definitive judicial or sociological determinations.
          </p>
          <p>
            All Trust Scores are computed using open, deterministic weighting formulas rather than opaque black-box AI scores:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
            <code>Trust Score = Security × 0.25 + Privacy × 0.25 + Reliability × 0.20 + Safety × 0.20 + Transparency × 0.10</code>
          </div>
        </div>
      </Card>
    </div>
  );
};
