import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { LearnedBadge, PersonalizationBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  Brain,
  History,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Bot,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const TrustMemoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        setLoading(true);
        const targetId = id || '11111111-1111-4000-8000-000000000001';
        const res = await api.get(`/ai-systems/${targetId}/trust-memory`);
        setData(res.data);
      } catch (err) {
        addToast('Failed to load trust memory', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMemory();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-cyan-400 font-mono text-xs">Loading Trust Memory & Timeline...</div>;
  }

  const { memories = [], whatTrustGuardLearned = [], timeline = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">Trust Memory & Learning Timeline</h1>
            <LearnedBadge label="Long-Term Knowledge" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trust Memory records recurring weaknesses, verified remediations, and firewall threat shifts to guide future evaluations.
          </p>
        </div>

        <button
          onClick={() => navigate('/evaluations')}
          className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2"
        >
          <span>Run Next Evaluation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: Trust Memory Items & Security Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Memory Catalog */}
        <Card title="Trust Memory Knowledge Base" subtitle="Accumulated findings stored per AI system">
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    {mem.memory_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">Confidence: {mem.confidence}</span>
                </div>
                <div className="text-white font-bold">{mem.memory_key}</div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{mem.memory_value}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Source: {mem.source}</span>
                  <span>Updated: {new Date(mem.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Learning Timeline (Section 36) */}
        <Card title="Security Learning Timeline" subtitle="Chronological progression of learning & score milestones">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 relative pl-4 border-l border-slate-800">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative space-y-1 text-xs font-mono">
                {/* Dot indicator */}
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#090d16] ${
                  event.type === 'vulnerability' ? 'bg-rose-500' : event.type === 'success' ? 'bg-emerald-400' : 'bg-cyan-400'
                }`} />

                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                  <span className="text-cyan-400 font-bold">{event.badge}</span>
                </div>

                <div className="font-bold text-white text-xs">{event.title}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
