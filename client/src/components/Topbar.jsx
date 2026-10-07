import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Bot, Shield, LogOut, ChevronDown, CheckCircle2, Play } from 'lucide-react';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState('');

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await api.get('/ai-systems');
        setSystems(res.data.aiSystems || []);
        if (res.data.aiSystems?.length > 0) {
          setSelectedSystemId(res.data.aiSystems[0].id);
        }
      } catch (err) {
        console.error('Failed to load AI systems in topbar:', err);
      }
    };
    fetchSystems();
  }, []);

  const handleSystemChange = (e) => {
    const id = e.target.value;
    setSelectedSystemId(id);
    navigate(`/ai-systems/${id}`);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: AI System Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400">Target AI:</span>
          <select
            value={selectedSystemId}
            onChange={handleSystemChange}
            className="bg-transparent text-xs font-mono text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            {systems.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name} ({s.profile?.industry || 'Demo'})
              </option>
            ))}
          </select>
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Engine Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
            <Shield className="w-3 h-3 text-cyan-400" />
            Firewall Active
          </span>
        </div>
      </div>

      {/* Right: Quick Demo Actions & User Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evaluations/compare')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/20 transition-all shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Before/After Demo</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user?.name || 'SecOps Lead'}</span>
            <span className="text-[10px] text-slate-500 font-mono">{user?.role || 'admin'}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-md transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
