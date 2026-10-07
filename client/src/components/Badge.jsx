import React from 'react';
import { Sparkles, Brain, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const SeverityBadge = ({ severity = 'low' }) => {
  const normalized = severity.toLowerCase();
  const styles = {
    critical: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    high: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    low: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    informational: 'bg-slate-800/60 text-slate-300 border-slate-600/40',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${styles[normalized] || styles.low}`}>
      {normalized.toUpperCase()}
    </span>
  );
};

export const ResultBadge = ({ result = 'pass' }) => {
  const normalized = result.toLowerCase();
  if (normalized === 'pass') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
        <CheckCircle className="w-3 h-3" /> PASS
      </span>
    );
  }
  if (normalized === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/40">
        <AlertTriangle className="w-3 h-3" /> WARN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-950/60 text-rose-400 border border-rose-500/40">
      <AlertTriangle className="w-3 h-3" /> FAIL
    </span>
  );
};

export const PersonalizationBadge = ({ label, type = 'personalized' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold uppercase bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-900/30">
      <Sparkles className="w-3 h-3 text-cyan-400" />
      {label || 'Personalized'}
    </span>
  );
};

export const LearnedBadge = ({ label = 'AI Learned' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold uppercase bg-purple-950/70 text-purple-300 border border-purple-500/50">
      <Brain className="w-3 h-3 text-purple-400" />
      {label}
    </span>
  );
};

export const FirewallBadge = ({ action = 'allow' }) => {
  const styles = {
    allow: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    warn: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
    block: 'bg-rose-950/60 text-rose-400 border-rose-500/40',
    redact: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${styles[action.toLowerCase()] || styles.allow}`}>
      <Shield className="w-3 h-3" />
      {action.toUpperCase()}
    </span>
  );
};
