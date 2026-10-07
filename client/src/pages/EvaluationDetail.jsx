import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { ScoreGauge } from '../components/ScoreGauge';
import { ResultBadge, SeverityBadge, PersonalizationBadge } from '../components/Badge';
import { ResultDrawer } from '../components/ResultDrawer';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  FileText,
  Clock,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const EvaluationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [evaluation, setEvaluation] = useState(null);
  const [results, setResults] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/evaluations/${id}`);
        setEvaluation(res.data.evaluation);
        setResults(res.data.results || []);
        setVulnerabilities(res.data.vulnerabilities || []);
      } catch (err) {
        addToast('Failed to load evaluation details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await api.post(`/reports/${id}/generate`);
      addToast('Security Audit Report generated!', 'success');
      navigate(`/reports/${res.data.report.id}`);
    } catch (err) {
      addToast('Failed to generate report', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-xs">Loading Assessment Results...</div>;
  }

  if (!evaluation) {
    return <div className="p-8 text-center text-rose-400 font-mono text-xs">Evaluation not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/evaluations')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-white">{evaluation.name}</h1>
              {evaluation.is_retest ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                  PROTECTED RETEST
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  BASELINE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-cyan-400">{evaluation.aiSystemName}</span> • Executed on {new Date(evaluation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>{generatingReport ? 'Compiling Audit...' : 'Generate Security Report'}</span>
        </button>
      </div>

      {/* Summary Score Card */}
      <div className="cyber-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
          <ScoreGauge score={Number(evaluation.trust_score)} size={160} subtitle="Assessment Trust Score" />
        </div>

        {/* Pillar Scores */}
        <div className="md:col-span-2 space-y-3 font-mono text-xs">
          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
            5 Trust Pillar Breakdown:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">SECURITY (25%)</span>
              <span className="text-base font-bold text-cyan-400">{evaluation.security_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">PRIVACY (25%)</span>
              <span className="text-base font-bold text-purple-400">{evaluation.privacy_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">RELIABILITY (20%)</span>
              <span className="text-base font-bold text-amber-400">{evaluation.reliability_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">SAFETY (20%)</span>
              <span className="text-base font-bold text-emerald-400">{evaluation.safety_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TRANSPARENCY (10%)</span>
              <span className="text-base font-bold text-blue-400">{evaluation.transparency_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">DURATION</span>
              <span className="text-base font-bold text-slate-200">{evaluation.duration_ms} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Table */}
      <Card
        title={`Executed Test Cases (${results.length})`}
        subtitle="Click any row to open the complete inspection drawer"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase">
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Attack Prompt Preview</th>
                <th className="pb-3 font-semibold">Why Selected</th>
                <th className="pb-3 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedResult(r)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3">
                    <ResultBadge result={r.result} />
                  </td>
                  <td className="py-3 font-bold text-white">{r.category}</td>
                  <td className="py-3">
                    <SeverityBadge severity={r.severity} />
                  </td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{r.prompt}</td>
                  <td className="py-3 text-cyan-400 text-[11px] max-w-xs truncate">
                    {r.why_selected || 'Personalized'}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspection Drawer */}
      <ResultDrawer result={selectedResult} onClose={() => setSelectedResult(null)} />
    </div>
  );
};
