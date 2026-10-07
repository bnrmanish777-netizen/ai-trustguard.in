import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { PersonalizationBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { FileText, ArrowRight, ShieldCheck, Download, Calendar } from 'lucide-react';

export const Reports = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports');
        setReports(res.data.reports || []);
      } catch {
        addToast('Failed to load reports', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">Security Audit Reports</h1>
            <PersonalizationBadge label="Formal Audits" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persisted cybersecurity executive summaries, risk breakdowns, and verified compliance assessments.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="cyber-card p-5 space-y-3 font-mono text-xs border border-slate-800 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">{r.title}</h3>
              </div>
              <p className="text-slate-400 text-xs font-sans line-clamp-2 max-w-2xl">{r.executive_summary}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Target: <strong className="text-slate-300">{r.aiSystemName}</strong></span>
                <span>Audit Date: {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/reports/${r.id}`)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 flex items-center gap-1.5 shrink-0"
            >
              <span>View Formal Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="cyber-card p-12 text-center text-slate-500 font-mono text-xs">
            No audit reports generated yet. Run an evaluation and click "Generate Security Report".
          </div>
        )}
      </div>
    </div>
  );
};
