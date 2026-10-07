import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Sparkles,
  Brain,
  ShieldCheck,
  Flame,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  GitCompare,
} from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const handleLaunchDemo = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  const steps = [
    { title: 'UNDERSTAND', desc: 'Analyzes AI purpose, industry context, data sensitivity, and tolerance boundaries.' },
    { title: 'PERSONALIZE', desc: 'Builds tailored risk profiles and derives unique testing weight distributions.' },
    { title: 'ATTACK', desc: 'Executes targeted adversarial injection, PII extraction, and jailbreak vectors.' },
    { title: 'DETECT', desc: 'Combines deterministic regex/NER scanners with semantic AI evaluation.' },
    { title: 'EXPLAIN', desc: 'Generates transparent "Why This Test?" rationale and score deduction drivers.' },
    { title: 'PROTECT', desc: 'Enforces real-time AI TrustGuard Firewall with personalized blocking & redaction.' },
    { title: 'LEARN', desc: 'Accumulates Trust Memory across recurring vulnerabilities and firewall events.' },
    { title: 'ADAPT', desc: 'Escalates difficulty dynamically and personalizes future security evaluations.' },
  ];

  return (
    <div className="space-y-24 py-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section (Section 62) */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HACKATHON THEME: PERSONALIZED AI EXPERIENCES</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Security testing that <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">adapts to your AI</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          AI TrustGuard learns your AI system's purpose, risk profile, vulnerabilities, and security history to create personalized security evaluations and real-time firewall protection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold font-mono text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Start AI Security Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold font-mono text-sm bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try 3-Minute Demo AI</span>
          </button>
        </div>

        {/* Comparison Callout */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-bold">Key Differentiator:</span> TrustGuard does not treat every AI system the same. Customer Support AI tests for PII and injections; Coding AI tests for secret leakage; Financial AI tests for hallucinations.
        </div>
      </section>

      {/* 8-Step Lifecycle Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            The Continuous Personalization Loop
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From contextual discovery to real-time firewall protection and adaptive retesting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="cyber-card p-5 space-y-2 hover:border-cyan-500/40">
              <div className="flex items-center justify-between text-cyan-400 font-mono text-xs font-bold">
                <span>0{idx + 1}</span>
                <span>{s.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After Retest Showcase Card */}
      <section className="cyber-card p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PROVEN RETEST RESULTS</span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white">
              Demonstrated Score Jump: 68 → 91 (+23)
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When AI TrustGuard Firewall policies are personalized and enforced, prompt injections are intercepted and synthetic customer PII is redacted in real-time, converting baseline vulnerabilities into verified passes.
            </p>
            <button
              onClick={handleLaunchDemo}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold"
            >
              <span>Explore Interactive Comparison View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span>METRIC</span>
              <span>BEFORE</span>
              <span>AFTER</span>
            </div>
            <div className="flex justify-between text-white font-semibold">
              <span>Overall Trust Score</span>
              <span className="text-amber-400">68.20</span>
              <span className="text-emerald-400 font-bold">91.00 (+23)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>PII Leakage Failures</span>
              <span className="text-rose-400">2 Failed</span>
              <span className="text-emerald-400">0 (Redacted)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Prompt Injection Attacks</span>
              <span className="text-rose-400">3 Successful</span>
              <span className="text-emerald-400">0 (Blocked)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Personalization Confidence</span>
              <span className="text-slate-400">72%</span>
              <span className="text-cyan-400 font-bold">94%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
