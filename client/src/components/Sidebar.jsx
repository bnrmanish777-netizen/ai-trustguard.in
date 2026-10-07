import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Cpu,
  Sparkles,
  Activity,
  GitCompare,
  AlertTriangle,
  Flame,
  Terminal,
  BookOpen,
  FileText,
  ShieldCheck,
  Info,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-systems', label: 'AI Systems', icon: Cpu },
  { to: '/evaluations', label: 'Evaluations', icon: Activity },
  { to: '/evaluations/compare', label: 'Compare (Before/After)', icon: GitCompare, badge: '+23 Demo' },
  { to: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
  { to: '/ai-firewall', label: 'AI Firewall', icon: Flame, badge: 'Live' },
  { to: '/incidents', label: 'Security Incidents', icon: ShieldAlert, badge: 'Active' },
  { to: '/test-playground', label: 'Test Playground', icon: Terminal },
  { to: '/test-library', label: 'Test Library', icon: BookOpen },
  { to: '/reports', label: 'Security Reports', icon: FileText },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white font-mono">TRUSTGUARD</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1 rounded font-mono font-bold">AI</span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider block font-mono">ADAPTIVE SECURITY</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Platform Security
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Knowledge & Ethics
        </div>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`
          }
        >
          <Info className="w-4 h-4" />
          <span>About Architecture</span>
        </NavLink>
        <NavLink
          to="/security"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`
          }
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ethics & Disclaimer</span>
        </NavLink>
      </div>

      {/* Footer Tagline Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Personalization Loop</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            Understand • Attack • Detect • Protect • Learn
          </p>
        </div>
      </div>
    </aside>
  );
};
