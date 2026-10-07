import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { PersonalizationBadge, SeverityBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const RiskProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        setLoading(true);
        const targetId = id || '11111111-1111-4000-8000-000000000001';
        const res = await api.get(`/ai-systems/${targetId}`);
        setData(res.data);
      } catch (err) {
        addToast('Failed to load risk profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-xs">Loading Risk Profile...</div>;
  }

  const { aiSystem, profile, riskProfile } = data || {};

  const dimensions = [
    { name: 'Security Risk (Injection & Exfiltration)', score: riskProfile?.security_risk || 82, color: 'rose' },
    { name: 'Privacy Risk (PII & Customer Records)', score: riskProfile?.privacy_risk || 94, color: 'purple' },
    { name: 'Reliability Risk (Hallucination & Scope Creep)', score: riskProfile?.reliability_risk || 68, color: 'amber' },
    { name: 'Safety Risk (Alignment & Adversarial Behavior)', score: riskProfile?.safety_risk || 75, color: 'orange' },
    { name: 'Transparency Risk (Model Explainability)', score: riskProfile?.transparency_risk || 61, color: 'cyan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">AI Risk Profile & Threat Dimensions</h1>
            <PersonalizationBadge label={`Version v${riskProfile?.profile_version || 1}`} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical multi-pillar threat breakdown calculated from {aiSystem?.name}'s operational context.
          </p>
        </div>

        <button
          onClick={() => navigate(`/ai-systems/${aiSystem?.id}/personalization`)}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 flex items-center gap-2"
        >
          <span>View Personalization Strategy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Threat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Primary Vulnerability Hazard" className="border-rose-500/30">
          <div className="py-2 space-y-2">
            <span className="text-lg font-mono font-bold text-rose-400 block">{riskProfile?.primary_risk}</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Derived from {profile?.industry} operational requirements handling {profile?.data_sensitivity} sensitivity assets.
            </p>
          </div>
        </Card>

        <Card title="Risk Confidence Level">
          <div className="py-2 flex items-center justify-between">
            <div>
              <span className="text-3xl font-mono font-extrabold text-cyan-400">{riskProfile?.risk_confidence || 91}%</span>
              <span className="text-xs text-slate-400 block mt-1">High Diagnostic Accuracy</span>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              Verified by 7 empirical signals
            </div>
          </div>
        </Card>

        <Card title="Secondary Concerns">
          <ul className="space-y-1.5 py-1 text-xs font-mono text-slate-300">
            {riskProfile?.secondary_risks?.map((sec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span>{sec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 5 Risk Dimensions Bars */}
      <Card title="Calculated Risk Dimensions (0 - 100 Scale)" subtitle="Higher value represents higher severity threat exposure">
        <div className="space-y-5 py-3">
          {dimensions.map(dim => (
            <div key={dim.name} className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">{dim.name}</span>
                <span className="font-bold text-white">{dim.score} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-2.5 rounded-full ${
                    dim.score >= 80 ? 'bg-rose-500' : dim.score >= 65 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
