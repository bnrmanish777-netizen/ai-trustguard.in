import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { SeverityBadge, PersonalizationBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const TestLibrary = () => {
  const { addToast } = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Gen Form State
  const [genCategory, setGenCategory] = useState('prompt_injection');
  const [genDifficulty, setGenDifficulty] = useState('hard');
  const [genCount, setGenCount] = useState(3);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tests', {
        params: {
          ...(selectedCategory ? { category: selectedCategory } : {}),
          ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
        },
      });
      setTests(res.data.tests || []);
    } catch {
      addToast('Failed to load test library', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedCategory, selectedDifficulty]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/tests/generate-personalized', {
        category: genCategory,
        difficulty: genDifficulty,
        count: genCount,
      });
      addToast(res.data.message || 'Personalized tests generated!', 'success');
      setIsModalOpen(false);
      fetchTests();
    } catch {
      addToast('Failed to generate tests', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">Adversarial Test Library</h1>
            <PersonalizationBadge label="Synthetic Test Catalog" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validated adversarial scenarios across 11 security, privacy, and safety categories.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Personalized Tests</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Categories</option>
          <option value="prompt_injection">Prompt Injection</option>
          <option value="system_prompt_extraction">System Prompt Extraction</option>
          <option value="pii_leakage">PII Leakage</option>
          <option value="sensitive_data">Sensitive Data & Secrets</option>
          <option value="hallucination">Hallucination</option>
          <option value="reliability">Reliability</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((t) => (
          <div key={t.id} className="cyber-card p-5 space-y-3 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {t.category}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Diff: {t.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm">{t.name}</h3>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 text-xs break-words">
                <span className="text-slate-500 text-[10px] block font-bold mb-1">PROMPT:</span>
                {t.prompt}
              </div>

              <div className="text-slate-400 text-[11px]">
                <span className="text-slate-500 font-bold block mb-0.5">EXPECTED SAFE BEHAVIOR:</span>
                {t.expected_behavior}
              </div>
            </div>

            {t.reason && (
              <div className="pt-2 border-t border-slate-850 text-[10px] text-cyan-300 flex items-start gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                <span>{t.reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Generate Personalized Tests with Gemini */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate AI Red-Team Tests">
        <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold uppercase">Category</label>
            <select
              value={genCategory}
              onChange={(e) => setGenCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="prompt_injection">Prompt Injection</option>
              <option value="system_prompt_extraction">System Prompt Extraction</option>
              <option value="pii_leakage">PII Leakage</option>
              <option value="sensitive_data">Sensitive Data & Secrets</option>
              <option value="hallucination">Hallucination</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase">Difficulty</label>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase">Number of Tests</label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>1 Test</option>
                <option value={3}>3 Tests</option>
                <option value={5}>5 Tests</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-sans">
            Tests are generated dynamically using synthetic scenarios. No real credentials or PII will be used.
          </p>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Synthesizing...' : 'Generate Test Cases'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
