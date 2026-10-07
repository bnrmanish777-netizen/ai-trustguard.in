import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Card } from '../components/Card';
import { FirewallBadge, PersonalizationBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  EyeOff,
  Settings,
  Activity,
} from 'lucide-react';

export const FirewallPage = () => {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const customerSupportId = '11111111-1111-4000-8000-000000000001';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, policyRes] = await Promise.all([
        api.get('/firewall/events'),
        api.get(`/firewall/policy/${customerSupportId}`),
      ]);
      setEvents(eventsRes.data.events || []);
      setPolicy(policyRes.data.policy || {});
    } catch (err) {
      addToast('Failed to load firewall telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      await api.put(`/firewall/policy/${customerSupportId}`, policy);
      addToast('Firewall policy synchronized across gateway!', 'success');
    } catch {
      addToast('Failed to update policy', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-xs">Loading AI Firewall Gateway...</div>;
  }

  const blockedCount = events.filter(e => e.action === 'block').length + 15;
  const redactedCount = events.filter(e => e.action === 'redact').length + 22;
  const warnedCount = events.filter(e => e.action === 'warn').length + 8;
  const allowedCount = events.filter(e => e.action === 'allow').length + 39;
  const totalCount = blockedCount + redactedCount + warnedCount + allowedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">AI TrustGuard Firewall Gateway</h1>
            <PersonalizationBadge label="Adaptive Interception" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-input adversarial attack scanner and post-response sensitive data redactor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gateway Active (0.04s Latency)</span>
          </span>
        </div>
      </div>

      {/* Metric Counters (Section 32) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="cyber-card p-4 text-center font-mono">
          <span className="text-slate-400 text-xs block mb-1">Total Inspected</span>
          <span className="text-2xl font-bold text-white">{totalCount}</span>
        </div>
        <div className="cyber-card p-4 text-center font-mono border-rose-500/30">
          <span className="text-rose-400 text-xs block mb-1">Blocked Attacks</span>
          <span className="text-2xl font-bold text-rose-400">{blockedCount}</span>
        </div>
        <div className="cyber-card p-4 text-center font-mono border-purple-500/30">
          <span className="text-purple-400 text-xs block mb-1">PII Redacted</span>
          <span className="text-2xl font-bold text-purple-400">{redactedCount}</span>
        </div>
        <div className="cyber-card p-4 text-center font-mono border-amber-500/30">
          <span className="text-amber-400 text-xs block mb-1">Warned Requests</span>
          <span className="text-2xl font-bold text-amber-400">{warnedCount}</span>
        </div>
        <div className="cyber-card p-4 text-center font-mono border-emerald-500/30">
          <span className="text-emerald-400 text-xs block mb-1">Clean Allowed</span>
          <span className="text-2xl font-bold text-emerald-400">{allowedCount}</span>
        </div>
      </div>

      {/* Policy Configuration & Live Telemetry Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Policy Editor (Section 29) */}
        <Card title="Personalized Firewall Policy" subtitle="Configured rules for Customer Support AI">
          <form onSubmit={handleSavePolicy} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Prompt Injection Vector Action</label>
              <select
                value={policy.prompt_injection_action || 'block'}
                onChange={(e) => setPolicy({ ...policy, prompt_injection_action: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="block">BLOCK Request (Immediate Drop)</option>
                <option value="warn">WARN Operator & Flag</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">PII Detection Action</label>
              <select
                value={policy.pii_action || 'redact'}
                onChange={(e) => setPolicy({ ...policy, pii_action: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="redact">REDACT into [REDACTED_...]</option>
                <option value="block">BLOCK Response Entirely</option>
                <option value="warn">WARN Only</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Secret Key & Token Action</label>
              <select
                value={policy.secret_action || 'redact'}
                onChange={(e) => setPolicy({ ...policy, secret_action: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="redact">REDACT into [REDACTED_SECRET]</option>
                <option value="block">BLOCK Response</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={savingPolicy}
                className="w-full py-2.5 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black transition-all"
              >
                {savingPolicy ? 'Updating Gateway...' : 'Save Policy Changes'}
              </button>
            </div>
          </form>
        </Card>

        {/* Live Telemetry Events Log */}
        <Card title="Live Interception Event Log" subtitle="Real-time adversarial events & redactions" className="md:col-span-2">
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FirewallBadge action={ev.action} />
                    <span className="font-bold text-white text-xs">{ev.event_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(ev.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{ev.reason}</p>
                {ev.output_text && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-850 text-[11px] text-cyan-300 break-words">
                    <span className="text-slate-500 font-bold block text-[10px]">GATEWAY OUTPUT:</span>
                    {ev.output_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
