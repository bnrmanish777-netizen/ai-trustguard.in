import React from 'react';
import { Card } from '../components/Card';
import { PersonalizationBadge } from '../components/Badge';
import { ShieldAlert, Cpu, Sparkles, Brain, Flame, Layers } from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-mono text-white">System Architecture & Hackathon Vision</h1>
          <PersonalizationBadge label="Personalized AI Experiences" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          How AI TrustGuard adapts security testing and firewall policies to every unique AI system.
        </p>
      </div>

      <Card title="The Hackathon Problem Statement">
        <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            Traditional AI red-teaming treats every AI model generically, running the same static test suite regardless of context. However, a <strong>Customer Support AI</strong> (handling customer addresses and returns) has radically different risk exposures compared to a <strong>Coding Assistant</strong> (handling API keys and bash scripts) or a <strong>Financial Advisory AI</strong> (handling market returns and wealth portfolios).
          </p>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
            <strong>AI TrustGuard Core Philosophy:</strong> Understand • Personalize • Attack • Detect • Protect • Learn • Adapt.
          </div>
        </div>
      </Card>

      <Card title="Technical Architecture & Separation of Concerns">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">1. FRONTEND</span>
            <span className="text-slate-400 text-[11px] block">React + Vite + Tailwind</span>
            <p className="text-slate-300 text-[11px]">Cybersecurity SaaS UI with Recharts, score gauges, and inspection drawers.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold block">2. BACKEND API</span>
            <span className="text-slate-400 text-[11px] block">Node.js + Express + Zod</span>
            <p className="text-slate-300 text-[11px]">JWT auth, rate limiting, deterministic Trust Score engine, and AI firewall gateway.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">3. DATABASE & AI</span>
            <span className="text-slate-400 text-[11px] block">Supabase Postgres + Gemini</span>
            <p className="text-slate-300 text-[11px]">14 normalized tables, foreign keys, and backend-only Google Gemini API calls.</p>
          </div>
        </div>
      </Card>

      <Card title="Trust Memory Subsystem">
        <div className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            Trust Memory ensures the platform remembers every evaluation outcome, recurring vulnerability, and intercepted attack over time. When an issue like PII leakage is resolved via firewall protection, Trust Memory marks it verified and automatically escalates testing to remaining concerns like hallucination.
          </p>
        </div>
      </Card>
    </div>
  );
};
