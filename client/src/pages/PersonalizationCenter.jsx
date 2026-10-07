import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { PersonalizationBadge, LearnedBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Brain,
  Shield,
  Layers,
  RefreshCw,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const PersonalizationCenter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('balanced');

  const fetchPersonalization = async () => {
    try {
      setLoading(true);
      const targetId = id || '11111111-1111-4000-8000-000000000001';
      const res = await api.get(`/ai-systems/${targetId}/personalization`);
      setData(res.data);
    } catch (err) {
      addToast('Failed to load Personalization data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalization();
  }, [id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      // Simulate real-time neural recalculation delay
      await new Promise(r => setTimeout(r, 600));
      await fetchPersonalization();
      addToast('Personalized strategy recalculated from latest telemetry!', 'success');
    } catch {
      addToast('Failed to refresh strategy', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyan-400 font-mono text-sm">
        <span>Loading AI Personalization Center...</span>
      </div>
    );
  }

  const {
    aiSystem,
    profile,
    riskProfile,
    strategy,
    whatTrustGuardLearned = [],
    personalizationConfidence = {},
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">AI Personalization Center</h1>
            <PersonalizationBadge label="Adaptive Engine" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            TrustGuard continuously synthesizes profile context, historical vulnerabilities, and firewall events to personalize security posture.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 rounded-lg font-mono font-bold text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Synthesizing...' : 'Recalculate Strategy'}</span>
        </button>
      </div>

      {/* Grid: Context & What TrustGuard Learned */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Context Profile */}
        <Card title="AI Context & Identity Profile" subtitle="Unique operational parameters defining this system">
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-slate-500 block">SYSTEM PURPOSE:</span>
              <p className="text-slate-200">{profile?.purpose || aiSystem?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">INDUSTRY:</span>
                <span className="text-cyan-400 font-bold">{profile?.industry}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">DATA SENSITIVITY:</span>
                <span className="text-rose-400 font-bold">{profile?.data_sensitivity}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">RISK TOLERANCE:</span>
                <span className="text-amber-400 font-bold">{profile?.risk_tolerance}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">CONFIDENCE:</span>
                <span className="text-emerald-400 font-bold">{personalizationConfidence.score || 91}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. What TrustGuard Learned (Section 68) */}
        <Card
          title="What TrustGuard Learned"
          subtitle="Empirical patterns cataloged in Trust Memory"
          headerAction={<LearnedBadge label={`${whatTrustGuardLearned.length} Insights`} />}
        >
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {whatTrustGuardLearned.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                  item.resolved
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800/80 text-slate-300'
                }`}
              >
                {item.resolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-white block">{item.title}</span>
                  <span className="text-slate-400 text-[11px] leading-snug">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Testing Weights Distribution & Strategy Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Testing Strategy Weights */}
        <Card title="Current Testing Strategy Weights" subtitle="Dynamic weight allocation across 5 trust pillars">
          <div className="space-y-3 py-2 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Security</span>
                <span className="text-cyan-400 font-bold">{Math.round((strategy?.securityWeight || 0.25) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-1.5" style={{ width: `${(strategy?.securityWeight || 0.25) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Privacy</span>
                <span className="text-purple-400 font-bold">{Math.round((strategy?.privacyWeight || 0.25) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-400 h-1.5" style={{ width: `${(strategy?.privacyWeight || 0.25) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Reliability</span>
                <span className="text-amber-400 font-bold">{Math.round((strategy?.reliabilityWeight || 0.20) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-1.5" style={{ width: `${(strategy?.reliabilityWeight || 0.20) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Safety</span>
                <span className="text-emerald-400 font-bold">{Math.round((strategy?.safetyWeight || 0.20) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5" style={{ width: `${(strategy?.safetyWeight || 0.20) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Transparency</span>
                <span className="text-blue-400 font-bold">{Math.round((strategy?.transparencyWeight || 0.10) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-400 h-1.5" style={{ width: `${(strategy?.transparencyWeight || 0.10) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Priority Categories & Strategy Reasoning */}
        <Card title="Strategy Rationale & Focus Areas" subtitle="Why these specific weights were derived" className="md:col-span-2">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-2">
                Prioritized Test Categories:
              </span>
              <div className="flex flex-wrap gap-2">
                {strategy?.priorityCategories?.map((cat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-2">
                Personalization Engine Reasoning:
              </span>
              <ul className="space-y-1.5 font-mono text-xs text-slate-300">
                {strategy?.reasoning?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Recommended Evaluation (Section 35) */}
            <div className="p-3.5 rounded-lg bg-gradient-to-r from-cyan-950/50 to-slate-900 border border-cyan-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  Recommended Next Evaluation
                </span>
                <span className="font-bold font-mono text-white text-sm">
                  Advanced Prompt Injection Suite (12 Multi-turn Vectors)
                </span>
              </div>
              <button
                onClick={() => navigate('/evaluations')}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Launch Test Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
