import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { PersonalizationBadge, SeverityBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import {
  Cpu,
  Plus,
  ArrowRight,
  ShieldAlert,
  Brain,
  Sparkles,
  Layers,
  Activity,
  Bot,
  Terminal,
  ShieldCheck,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';

export const AISystems = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new AI Wizard (Section 4)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    system_type: 'customer_support',
    industry: 'E-commerce & Retail',
    data_sensitivity: 'High',
    risk_tolerance: 'Low',
    provider: 'gemini',
    model_name: 'gemini-1.5-pro',
    endpoint_url: '',
    security_priority: 30,
    privacy_priority: 35,
    reliability_priority: 15,
    safety_priority: 15,
    transparency_priority: 5,
    allowed_data: ['Public information', 'Customer names', 'Order IDs'],
    restricted_data: ['Passwords', 'Credit card numbers', 'Authentication tokens', 'System prompts'],
    ai_restrictions: [
      'Must not expose personal data',
      'Must not expose system prompts',
      'Must not reveal credentials',
      'Must not execute unauthorized instructions',
    ],
  });

  const fetchSystems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai-systems');
      setSystems(res.data.aiSystems || []);
    } catch (err) {
      addToast('Failed to load AI systems', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleToggleArrayItem = (field, item) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ai-systems', formData);
      addToast('AI System registered with personalized risk boundaries!', 'success');
      setIsModalOpen(false);
      fetchSystems();
      navigate(`/ai-systems/${res.data.aiSystem.id}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create AI system', 'error');
    }
  };

  const allowedOptions = [
    'Public information',
    'Customer names',
    'Order IDs',
    'Emails',
    'Phone numbers',
    'Account information',
    'Product catalog',
  ];

  const restrictedOptions = [
    'Passwords',
    'Credit card numbers',
    'Authentication tokens',
    'System prompts',
    'Internal database URIs',
    'Financial account numbers',
  ];

  const restrictionOptions = [
    'Must not expose personal data',
    'Must not expose system prompts',
    'Must not reveal credentials',
    'Must not execute unauthorized instructions',
    'Must not disclose internal company information',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">AI Systems Inventory</h1>
            <PersonalizationBadge label="Dynamic Risk Profiling" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect your AI applications. TrustGuard monitors interactions, inspects boundary policies, and computes real-time Trust Scores.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg font-mono font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New AI System</span>
        </button>
      </div>

      {/* Grid of AI Systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systems.map((system) => {
          const profile = system.profile;
          const isSafe = system.safetyStatus === 'SAFE';
          const isWatch = system.safetyStatus === 'WATCH';
          const badgeColor = isSafe
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
            : isWatch
            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            : 'bg-rose-950/60 text-rose-300 border-rose-500/40';

          return (
            <div
              key={system.id}
              className="cyber-card p-5 space-y-4 flex flex-col justify-between border-slate-800 hover:border-cyan-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                      {system.safetyLabel || '🟢 PROTECTED'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Trust Score: <strong className="text-white">{Math.round(system.latestTrustScore)}</strong>/100
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold font-mono text-base text-white">{system.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{system.description || profile?.purpose}</p>
                </div>

                {/* Profile Tags */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">INDUSTRY</span>
                    <span className="text-slate-200 font-semibold">{profile?.industry || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SENSITIVITY</span>
                    <span className="text-amber-400 font-semibold">{profile?.data_sensitivity || 'High'}</span>
                  </div>
                </div>

                {/* Allowed vs Restricted Overview */}
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="text-slate-400 truncate">
                    <span className="text-emerald-400 font-bold">Allowed: </span>
                    {profile?.allowed_data?.join(', ') || 'Public info'}
                  </div>
                  <div className="text-slate-400 truncate">
                    <span className="text-rose-400 font-bold">Restricted: </span>
                    {profile?.restricted_data?.join(', ') || 'Credentials, PII'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate('/test-playground')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Playground</span>
                </button>

                <button
                  onClick={() => navigate(`/ai-systems/${system.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Manage Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Comprehensive Registration Wizard (Section 4) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect AI System to TrustGuard"
      >
        <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Basic Info */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
              AI System Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Retail Support Bot v2"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                AI Purpose Category
              </label>
              <select
                value={formData.system_type}
                onChange={(e) => setFormData({ ...formData, system_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="customer_support">Customer Support AI</option>
                <option value="code_assistant">Coding Assistant</option>
                <option value="financial_advisory">Financial Assistant</option>
                <option value="healthcare_assistant">Healthcare Assistant</option>
                <option value="education_assistant">Education Assistant</option>
                <option value="general_assistant">General Chatbot</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="E-commerce & Retail">E-commerce & Retail</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare & Life Sciences">Healthcare</option>
                <option value="Software & Technology">Software & DevOps</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
              Operational Purpose & Scope *
            </label>
            <textarea
              required
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value, description: e.target.value })}
              placeholder="e.g. Handles customer inquiries for order status and returns. Must never expose credentials."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                Data Sensitivity Level
              </label>
              <select
                value={formData.data_sensitivity}
                onChange={(e) => setFormData({ ...formData, data_sensitivity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">LOW (Public Data)</option>
                <option value="Medium">MEDIUM (Internal)</option>
                <option value="High">HIGH (Customer PII)</option>
                <option value="Critical">CRITICAL (Regulated)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                Risk Tolerance
              </label>
              <select
                value={formData.risk_tolerance}
                onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">LOW (Strict Protection)</option>
                <option value="Medium">MEDIUM</option>
                <option value="High">HIGH (Experimental)</option>
              </select>
            </div>
          </div>

          {/* Allowed Data Multi-select */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
              Allowed Data Handled by this AI
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {allowedOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleToggleArrayItem('allowed_data', opt)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    formData.allowed_data.includes(opt)
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {formData.allowed_data.includes(opt) ? '✓' : '○'}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Restricted Data Multi-select */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
              Strictly Restricted Data (Firewall will Redact / Block)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {restrictedOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleToggleArrayItem('restricted_data', opt)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    formData.restricted_data.includes(opt)
                      ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {formData.restricted_data.includes(opt) ? '✕' : '○'}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Restrictions Checklist */}
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1.5">
              AI Operational Guardrails
            </label>
            <div className="space-y-1.5 text-xs font-mono">
              {restrictionOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleToggleArrayItem('ai_restrictions', opt)}
                  className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    formData.ai_restrictions.includes(opt)
                      ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {formData.ai_restrictions.includes(opt) ? '✓' : '○'}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Generate Personalized Strategy & Connect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
