import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Info } from 'lucide-react';

export const IsAiSafeCard = ({ aiSystemId, onRetest }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSafety = async () => {
      try {
        if (!aiSystemId) return;
        const res = await api.get(`/ai-systems/${aiSystemId}/safety`);
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || err.message);
          setLoading(false);
        }
      }
    };

    fetchSafety();
    const interval = setInterval(fetchSafety, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [aiSystemId]);

  if (loading) {
    return (
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-slate-800 rounded w-2/3 mb-4"></div>
        <div className="h-16 bg-slate-800/50 rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const isSafe = data.safetyStatus === 'SAFE';
  const isWatch = data.safetyStatus === 'WATCH';
  const isCritical = data.safetyStatus === 'CRITICAL' || data.safetyStatus === 'HIGH_RISK';

  const badgeColor = isSafe
    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
    : isWatch
    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
    : 'bg-rose-950/60 border-rose-500/40 text-rose-300';

  const statusGlow = isSafe
    ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/30'
    : isWatch
    ? 'shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/30'
    : 'shadow-[0_0_25px_rgba(244,63,94,0.2)] border-rose-500/40';

  return (
    <div className={`bg-gradient-to-br from-[#0c152e] via-[#091124] to-[#070d1d] border rounded-2xl p-6 transition-all ${statusGlow}`}>
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              AI Continuous Trust Diagnostic
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">Zero-Jargon View</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
            <span>IS THIS AI SAFE?</span>
            <span className={`text-sm px-3 py-1 rounded-full font-bold border ${badgeColor}`}>
              {data.statusLabel}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-mono">Dynamic Trust Score</div>
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span className={isSafe ? 'text-emerald-400' : isWatch ? 'text-amber-400' : 'text-rose-400'}>
                {Math.round(data.trustScore)}
              </span>
              <span className="text-xs text-slate-500 font-sans">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reason Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Summary: </span>
          {data.mainReason}
        </div>
      </div>

      {/* Two Column Diagnostic Checklists: Why Safe vs Watch Out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Why Considered Safe */}
        <div className="bg-[#0b1429]/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Why is it protected?</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {data.whySafe?.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">{item.substring(0, 1)}</span>
                <span>{item.substring(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Watch Items */}
        <div className="bg-[#0b1429]/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Watch Items</span>
          </div>
          {data.watchItems?.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {data.watchItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">{item.substring(0, 1)}</span>
                  <span>{item.substring(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No elevated risks detected. Operating under safe baseline.</p>
          )}
        </div>
      </div>

      {/* Allowed vs Restricted Data Policy Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Allowed: {data.allowedData?.slice(0, 3).join(', ')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Restricted: {data.restrictedData?.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last live inspection: a few seconds ago</span>
        </div>
      </div>
    </div>
  );
};
