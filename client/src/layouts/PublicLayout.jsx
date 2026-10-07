import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/80 bg-[#0a0f1d]/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white font-mono">AI TRUSTGUARD</span>
            <span className="text-[10px] text-cyan-400 tracking-wider block font-mono">ADAPTIVE SECURITY PLATFORM</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/about" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            Architecture
          </Link>
          <Link to="/security" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            Security & Ethics
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Launch Platform</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070a12] py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 AI TrustGuard. Built for the Personalized AI Experiences Hackathon.</p>
        <p className="mt-1 text-slate-600">Understand • Personalize • Attack • Detect • Protect • Learn • Adapt</p>
      </footer>
    </div>
  );
};
