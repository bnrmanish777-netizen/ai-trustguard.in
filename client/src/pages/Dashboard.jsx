import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { ScoreGauge } from '../components/ScoreGauge';
import { PersonalizationBadge } from '../components/Badge';
import { IsAiSafeCard } from '../components/IsAiSafeCard';
import {
  Sparkles,
  ShieldAlert,
  Brain,
  Activity,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Play,
  Flame,
  Terminal,
  Shield,
  Eye,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [liveStream, setLiveStream] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, streamRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/monitoring/stream?limit=6'),
      ]);
      setData(dashRes.data);
      setLiveStream(streamRes.data.events || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Live continuous polling every 6 seconds for real-time monitoring feel
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Connecting to AI TrustGuard Security Telemetry...</span>
        </div>
      </div>
    );
  }

  const {
    overallTrustScore = 74.50,
    confidenceScore = 91,
    signals = [],
    categoryScores = {},
    riskCounts = {},
    aiInsight = {},
    trustTrend = [],
    recentEvaluations = [],
    primarySystem,
    liveMonitoringStats = {},
    recentIncidents = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner: Active System & Mode */}
      <div className="cyber-card p-6 bg-gradient-to-r from-slate-900 via-[#0a142e] to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">INLINE FIREWALL & LIVE MONITOR ACTIVE</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Monitored Target:</span>
            <span className="text-xs font-mono font-bold text-white">{primarySystem?.name || 'Demo Customer Support AI'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-white">
            AI TrustGuard Continuous Security Posture
          </h1>
          <p className="text-xs text-slate-400">
            Sitting between user and AI application: inspects requests, enforces personalized risk policies, redacts PII, blocks prompt injections, and updates dynamic Trust Score.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/test-playground')}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Test Playground</span>
          </button>
          <button
            onClick={() => navigate('/incidents')}
            className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Incidents ({recentIncidents.length})</span>
          </button>
        </div>
      </div>

      {/* "IS THIS AI SAFE?" Prominent Diagnostic View (Section 19) */}
      <IsAiSafeCard aiSystemId={primarySystem?.id || '11111111-1111-4000-8000-000000000001'} />

      {/* CONTINUOUS MONITORING METRIC COUNTERS (Section 16: Continuous Trust Monitoring) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Interactions Monitored</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
            {liveMonitoringStats.totalMonitored || 12}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">100% Inspected</span>
        </div>

        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Threats Detected</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">
            {liveMonitoringStats.threatsDetected || 4}
          </span>
          <span className="text-[10px] text-amber-400 font-mono">Flagged by Rules</span>
        </div>

        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Threats Blocked</span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono mt-1 block">
            {liveMonitoringStats.threatsBlocked || 3}
          </span>
          <span className="text-[10px] text-rose-400 font-mono">Zero Exposure</span>
        </div>

        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">PII Redactions</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 block">
            {liveMonitoringStats.redactions || 2}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Masked in Transit</span>
        </div>

        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Secrets Intercepted</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono mt-1 block">
            {liveMonitoringStats.secretsDetected || 1}
          </span>
          <span className="text-[10px] text-purple-400 font-mono">Credentials Protected</span>
        </div>

        <div className="bg-[#0b1328] border border-slate-800 p-3.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Injections Neutralized</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
            {liveMonitoringStats.promptInjectionsDetected || 2}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Firewall Defended</span>
        </div>
      </div>

      {/* Primary KPI Row: Trust Score Breakdown & AI Security Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Trust Score Pillar Breakdown */}
        <Card title="Trust Score Pillars" subtitle="Deterministic 25/25/20/20/10 Formula">
          <div className="py-2 flex flex-col items-center">
            <ScoreGauge score={overallTrustScore} size={160} />
            <div className="grid grid-cols-2 gap-2.5 w-full mt-4 text-[11px] font-mono border-t border-slate-800/80 pt-3">
              <div className="text-slate-400">Security (25%): <span className="text-white font-bold">{categoryScores.security}%</span></div>
              <div className="text-slate-400">Privacy (25%): <span className="text-white font-bold">{categoryScores.privacy}%</span></div>
              <div className="text-slate-400">Reliability (20%): <span className="text-white font-bold">{categoryScores.reliability}%</span></div>
              <div className="text-slate-400">Safety (20%): <span className="text-white font-bold">{categoryScores.safety}%</span></div>
            </div>
          </div>
        </Card>

        {/* Dynamic AI Insight & Recommended Action (Section 24) */}
        <Card
          title="Security Recommendation"
          subtitle="Derived continuously from recent telemetry"
          className="border-cyan-500/30 bg-gradient-to-b from-slate-900 to-cyan-950/20"
        >
          <div className="space-y-3 py-1 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-medium">
                {aiInsight.highlight}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                {aiInsight.reasons?.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate('/evaluations')}
              className="w-full py-2.5 px-3 rounded-lg font-mono font-semibold text-xs bg-cyan-950/80 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>{aiInsight.recommendedAction || 'Run Recommended Test'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* Personalization Confidence */}
        <Card
          title="Personalization Confidence"
          subtitle="Profile signal completeness"
          headerAction={<span className="text-lg font-mono font-bold text-cyan-400">{confidenceScore}%</span>}
        >
          <div className="space-y-2 py-1">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-700" style={{ width: `${confidenceScore}%` }} />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block pt-1">
              Active Profile Signals:
            </span>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {signals.map((sig, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono">
                  <span className={sig.present ? 'text-slate-300' : 'text-slate-500'}>
                    {sig.present ? '✓' : '○'} {sig.name}
                  </span>
                  <span className={sig.present ? 'text-emerald-400 text-[10px]' : 'text-slate-600 text-[10px]'}>
                    {sig.present ? `+${sig.weight}%` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Live Activity Stream & Dynamic Trust Score Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LIVE SECURITY ACTIVITY FEED (Section 28) */}
        <Card
          title="Live Security Activity Stream"
          subtitle="Real-time telemetry stream from AI TrustGuard Gateway"
          headerAction={
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE FEED</span>
            </div>
          }
        >
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {liveStream.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">No interactions streamed yet.</p>
            ) : (
              liveStream.map(event => {
                const isBlocked = event.blocked;
                const isRedacted = event.policy_decision === 'redact';
                const time = new Date(event.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                const badge = isBlocked
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  : isRedacted
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';

                return (
                  <div
                    key={event.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{time}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badge}`}>
                          {isBlocked ? 'BLOCKED' : isRedacted ? 'REDACTED' : 'SAFE'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-300 truncate">
                          {event.prompt?.substring(0, 45)}...
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        Output: {event.response?.substring(0, 50)}...
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {event.latency_ms}ms
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => navigate('/test-playground')}
            className="w-full text-center text-xs font-mono text-cyan-400 hover:underline pt-3 block border-t border-slate-800/60 mt-3"
          >
            Send test interaction in playground →
          </button>
        </Card>

        {/* Dynamic Trust Score Timeline (Section 17: Trust Score History) */}
        <Card
          title="Trust Score History"
          subtitle="Dynamic timeline reflecting detected incidents & retests"
        >
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trustTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis domain={[40, 100]} stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-lg shadow-lg text-xs font-mono">
                          <div className="text-cyan-400 font-bold">Score: {data.trustScore}/100</div>
                          {data.change !== 0 && (
                            <div className={data.change < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                              Change: {data.change > 0 ? `+${data.change}` : data.change} pts
                            </div>
                          )}
                          <div className="text-slate-300 mt-1 max-w-[200px] text-[11px] font-sans">
                            {data.reason || 'Evaluation audit point'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trustScore"
                  name="Trust Score"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Security Incidents Table */}
      <Card
        title="Recent Security Incidents"
        subtitle="Interceptions recorded by AI TrustGuard Firewall"
        headerAction={
          <button
            onClick={() => navigate('/incidents')}
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            Open Incident Center ({recentIncidents.length}) →
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Threat Type</th>
                <th className="pb-3 font-semibold">Direction</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Score Impact</th>
                <th className="pb-3 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-400">
                    {new Date(inc.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-bold text-white">{inc.threat_type}</td>
                  <td className="py-3">
                    <span className="text-[11px] text-slate-300">
                      {inc.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.action_taken === 'blocked'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inc.action_taken}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-rose-400">
                    {inc.trust_score_impact || -4.00} pts
                  </td>
                  <td className="py-3 text-cyan-300">
                    {inc.recommended_action || 'Retest parameters'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
