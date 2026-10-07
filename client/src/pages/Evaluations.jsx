import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { PersonalizationBadge, ResultBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  Play,
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
} from 'lucide-react';

export const Evaluations = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [evaluations, setEvaluations] = useState([]);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [running, setRunning] = useState(false);

  // New Eval Form State
  const [selectedSystemId, setSelectedSystemId] = useState('');
  const [evalName, setEvalName] = useState('');
  const [withFirewall, setWithFirewall] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evalRes, sysRes] = await Promise.all([
        api.get('/evaluations'),
        api.get('/ai-systems'),
      ]);
      setEvaluations(evalRes.data.evaluations || []);
      setSystems(sysRes.data.aiSystems || []);
      if (sysRes.data.aiSystems?.length > 0 && !selectedSystemId) {
        setSelectedSystemId(sysRes.data.aiSystems[0].id);
      }
    } catch (err) {
      addToast('Failed to load evaluations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunEvaluation = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      const res = await api.post('/evaluations', {
        aiSystemId: selectedSystemId,
        name: evalName || 'Comprehensive Personalized Evaluation',
        withFirewall,
        isRetest: withFirewall,
      });
      addToast('Evaluation completed successfully!', 'success');
      setIsModalOpen(false);
      navigate(`/evaluations/${res.data.evaluation.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to run evaluation', 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">Security Evaluations</h1>
            <PersonalizationBadge label="Adaptive Test Execution" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controlled adversarial attack execution, hybrid detection, and deterministic Trust Score calculation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch New Evaluation</span>
        </button>
      </div>

      {/* Evaluations Table Card */}
      <Card title="Evaluation History" subtitle="Verified security audit runs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase">
                <th className="pb-3 font-semibold">Assessment Title</th>
                <th className="pb-3 font-semibold">Target AI System</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Trust Score</th>
                <th className="pb-3 font-semibold">Passed / Total</th>
                <th className="pb-3 font-semibold">Mode</th>
                <th className="pb-3 font-semibold text-right">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluations.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 font-bold text-white">{e.name}</td>
                  <td className="py-3.5 text-cyan-400">{e.aiSystemName}</td>
                  <td className="py-3.5 text-slate-400">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5">
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      e.trust_score >= 80 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                    }`}>
                      {e.trust_score} / 100
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    {e.passed_tests} / {e.total_tests}
                  </td>
                  <td className="py-3.5">
                    {e.is_retest ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        FIREWALL PROTECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        BASELINE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/evaluations/${e.id}`)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Launch New Evaluation */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure & Launch Evaluation">
        <form onSubmit={handleRunEvaluation} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
              Select Target AI System *
            </label>
            <select
              value={selectedSystemId}
              onChange={(e) => setSelectedSystemId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {systems.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.profile?.industry || 'System'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
              Evaluation Name
            </label>
            <input
              type="text"
              value={evalName}
              onChange={(e) => setEvalName(e.target.value)}
              placeholder="e.g. Q4 Adversarial Regression Audit"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Firewall Protection Toggle */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enable AI TrustGuard Firewall Protection</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                Inspect prompts & redact responses through personalized gateway (Demonstrates score improvement).
              </p>
            </div>
            <input
              type="checkbox"
              checked={withFirewall}
              onChange={(e) => setWithFirewall(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            TrustGuard will dynamically select tests tailored to this AI's sensitivity profile and historical weaknesses.
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={running}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{running ? 'Executing Tests...' : 'Execute Test Plan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
