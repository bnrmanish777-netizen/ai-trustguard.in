import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Card } from '../components/Card';
import { SeverityBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Filter,
  Check,
} from 'lucide-react';

export const Vulnerabilities = () => {
  const { addToast } = useToast();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vulnerabilities', {
        params: {
          ...(selectedSeverity ? { severity: selectedSeverity } : {}),
          ...(selectedStatus ? { status: selectedStatus } : {}),
        },
      });
      setVulnerabilities(res.data.vulnerabilities || []);
    } catch (err) {
      addToast('Failed to load vulnerabilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, [selectedSeverity, selectedStatus]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/vulnerabilities/${id}`, { status: newStatus });
      addToast(`Status updated to ${newStatus}`, 'success');
      fetchVulnerabilities();
    } catch {
      addToast('Failed to update vulnerability status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-white">Vulnerability Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, remediate, or accept risks identified across adversarial AI red-team evaluations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="risk_accepted">Risk Accepted</option>
          </select>
        </div>
      </div>

      {/* Vulnerabilities Cards / Table */}
      <div className="space-y-4">
        {vulnerabilities.map((v) => (
          <div
            key={v.id}
            className={`cyber-card p-5 space-y-3 font-mono text-xs border ${
              v.status === 'resolved'
                ? 'border-emerald-500/30 bg-slate-900/40'
                : v.severity === 'critical'
                ? 'border-rose-500/40'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <SeverityBadge severity={v.severity} />
                <span className="font-bold text-white text-sm">{v.title}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  {v.category}
                </span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Status:</span>
                <select
                  value={v.status}
                  onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-bold font-mono focus:outline-none cursor-pointer ${
                    v.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : v.status === 'in_progress'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : v.status === 'risk_accepted'
                      ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  <option value="open">OPEN</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="resolved">RESOLVED</option>
                  <option value="risk_accepted">RISK ACCEPTED</option>
                </select>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-sans">{v.description}</p>

            {v.evidence && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-[11px] text-amber-300">
                <span className="text-slate-500 font-bold block mb-0.5">EVIDENCE CAPTURED:</span>
                {v.evidence}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-850 text-[11px]">
              <div>
                <span className="text-slate-500 font-bold block">IMPACT:</span>
                <span className="text-slate-300">{v.impact}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">RECOMMENDED REMEDIATION:</span>
                <span className="text-emerald-400">{v.recommendation}</span>
              </div>
            </div>
          </div>
        ))}

        {vulnerabilities.length === 0 && (
          <div className="cyber-card p-12 text-center text-slate-500 font-mono text-xs">
            No vulnerabilities matching current filters.
          </div>
        )}
      </div>
    </div>
  );
};
