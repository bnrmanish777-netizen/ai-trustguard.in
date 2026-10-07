import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ScoreGauge } from '../components/ScoreGauge';
import { SeverityBadge, ResultBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Printer,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${id}`);
        setReport(res.data.report);
      } catch (err) {
        addToast('Failed to load report', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-xs">Loading Security Audit Report...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-rose-400 font-mono text-xs">Report not found</div>;
  }

  const { report_data: data } = report;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controls */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/reports')}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Formal Cybersecurity Audit Document Layout */}
      <div className="cyber-card p-8 md:p-10 space-y-8 bg-[#0b1020] border-slate-700 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>AI TRUSTGUARD RED-TEAM AUDIT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight">
              {report.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Audit Assessment ID: {report.id}
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div>Date: <strong className="text-slate-200">{new Date(report.created_at).toLocaleDateString()}</strong></div>
            <div>Classification: <strong className="text-rose-400">CONFIDENTIAL (INTERNAL)</strong></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            1. Executive Summary
          </h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed">
            {report.executive_summary}
          </div>
        </div>

        {/* AI System Information & Risk Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              2. Target System Identity
            </h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-slate-500">System:</span><span className="text-white font-bold">{data.aiSystem?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Industry:</span><span className="text-slate-300">{data.aiSystem?.industry}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Data Sensitivity:</span><span className="text-amber-400 font-bold">{data.aiSystem?.dataSensitivity}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Risk Tolerance:</span><span className="text-slate-300">{data.aiSystem?.riskTolerance}</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              3. Diagnostic Risk Baseline
            </h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Primary Risk:</span><span className="text-rose-400 font-bold">{data.riskProfile?.primaryRisk}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Security Risk:</span><span className="text-slate-300">{data.riskProfile?.scores?.security} / 100</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Privacy Risk:</span><span className="text-slate-300">{data.riskProfile?.scores?.privacy} / 100</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Diagnostic Confidence:</span><span className="text-cyan-400 font-bold">{data.evaluationMetrics?.personalizationConfidence}%</span></div>
            </div>
          </div>
        </div>

        {/* Audit Results & Pillar Scores */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            4. Deterministic Trust Score Assessment
          </h2>
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">SECURITY</span>
              <span className="text-lg font-bold text-cyan-400">{data.evaluationMetrics?.categoryScores?.security}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">PRIVACY</span>
              <span className="text-lg font-bold text-purple-400">{data.evaluationMetrics?.categoryScores?.privacy}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">RELIABILITY</span>
              <span className="text-lg font-bold text-amber-400">{data.evaluationMetrics?.categoryScores?.reliability}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SAFETY</span>
              <span className="text-lg font-bold text-emerald-400">{data.evaluationMetrics?.categoryScores?.safety}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">OVERALL TRUST</span>
              <span className="text-2xl font-extrabold text-white">{data.evaluationMetrics?.trustScore}/100</span>
            </div>
          </div>
        </div>

        {/* Discovered Findings List */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            5. Key Findings & Remediation Steps
          </h2>
          <div className="space-y-3 font-mono text-xs">
            {data.findingsSummary?.criticalFindings?.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity="critical" />
                  <span className="font-bold text-white">{f.title}</span>
                </div>
                <div className="text-slate-400 text-[11px]">{f.evidence}</div>
                <div className="text-emerald-400 text-[11px] pt-1 border-t border-slate-850">
                  <strong>Remediation:</strong> {f.recommendation}
                </div>
              </div>
            ))}

            {data.findingsSummary?.criticalFindings?.length === 0 && (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                Zero critical vulnerabilities active. All high-severity vectors verified mitigated.
              </div>
            )}
          </div>
        </div>

        {/* Mandatory Section 45 Report Disclaimer */}
        <div className="border-t border-slate-800 pt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
            <strong className="text-slate-200 block mb-1">MANDATORY SECURITY DISCLAIMER:</strong>
            {data.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
