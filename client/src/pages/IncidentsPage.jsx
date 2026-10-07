import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

export const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterThreat, setFilterThreat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState({});

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents');
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedback = async (incidentId, feedbackType) => {
    try {
      await api.post(`/incidents/${incidentId}/feedback`, {
        feedback: feedbackType,
        category: feedbackType,
      });
      setFeedbackSuccess(prev => ({ ...prev, [incidentId]: feedbackType }));
      // Update local incident record
      setIncidents(prev =>
        prev.map(i => (i.id === incidentId ? { ...i, user_feedback: feedbackType } : i))
      );
    } catch (err) {
      console.error('Failed to record incident feedback', err);
    }
  };

  const filteredIncidents = incidents.filter(i => {
    if (filterSeverity !== 'all' && i.severity?.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false;
    }
    if (filterThreat !== 'all' && !i.threat_type?.toLowerCase().includes(filterThreat.toLowerCase())) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        i.threat_type?.toLowerCase().includes(term) ||
        i.detection_reason?.toLowerCase().includes(term) ||
        i.aiSystemName?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              Incident Response & Forensics
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-emerald-400">Live Recording</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
            <span>Security Incident Center</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Audit every intercepted prompt injection, confidential secret probe, and customer PII leakage attempt in real time with dynamic Trust Score impacts.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incident Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0a1021] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by threat, AI system, or reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono">Severity:</span>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Threat Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono">Threat:</span>
            <select
              value={filterThreat}
              onChange={e => setFilterThreat(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Threats</option>
              <option value="pii">PII Leakage</option>
              <option value="prompt injection">Prompt Injection</option>
              <option value="secret">Secret Exposure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Stream Cards */}
      {loading && incidents.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-mono text-xs">
          Loading live security incidents...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-16 bg-[#0a1021] border border-slate-800 rounded-xl">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Matching Security Incidents</h3>
          <p className="text-xs text-slate-400 mt-1">All monitored interactions are currently adhering to personalized policies.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map(incident => {
            const isCritical = incident.severity?.toLowerCase() === 'critical';
            const isHigh = incident.severity?.toLowerCase() === 'high';
            const isInbound = incident.direction === 'inbound';

            const severityBadge = isCritical
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              : isHigh
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
              : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300';

            const actionBadge = incident.action_taken === 'blocked'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : incident.action_taken === 'redacted'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

            const formattedTime = new Date(incident.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={incident.id}
                className="bg-[#0b1328] hover:bg-[#0c1630] border border-slate-800 rounded-xl p-5 transition-all shadow-md"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${severityBadge}`}>
                      {incident.severity || 'HIGH'}
                    </span>

                    <h3 className="text-sm font-bold text-white font-mono">
                      {incident.threat_type}
                    </h3>

                    <span className="text-slate-600">•</span>

                    <span className="text-xs font-semibold text-cyan-300">
                      {incident.aiSystemName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formattedTime}</span>
                    </div>

                    <span
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
                        isInbound
                          ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                          : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {isInbound ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{isInbound ? 'INBOUND' : 'OUTBOUND'}</span>
                    </span>
                  </div>
                </div>

                {/* Incident Core Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Left 2 Cols: Reason & Content Sample */}
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <span className="text-slate-400 font-mono text-[11px] block">Detection Reason:</span>
                      <p className="text-slate-200 mt-0.5 font-sans leading-relaxed">
                        {incident.detection_reason}
                      </p>
                    </div>

                    {incident.input_text && (
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-900 font-mono text-[11px] text-slate-300">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Input Sample:</span>
                        <div className="truncate mt-0.5">{incident.input_text}</div>
                      </div>
                    )}
                  </div>

                  {/* Right Col: Action & Score Impact */}
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-400 font-mono text-[11px]">Action Enforced:</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${actionBadge}`}>
                          {incident.action_taken}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">Trust Score Impact:</span>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {incident.trust_score_impact || -4.00} pts
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-mono text-[11px] block">Recommended Action:</span>
                      <div className="text-[11px] text-cyan-300 font-medium mt-0.5">
                        {incident.recommended_action || 'Retest security parameters'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Feedback Bar */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Firewall Learning Active: Updates Trust Memory automatically</span>
                  </div>

                  {/* Feedback Controls (Section 25) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Useful detection?</span>
                    <button
                      onClick={() => handleFeedback(incident.id, 'useful')}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        incident.user_feedback === 'useful' || feedbackSuccess[incident.id] === 'useful'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Correct detection"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Yes</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(incident.id, 'false_positive')}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        incident.user_feedback === 'false_positive' || feedbackSuccess[incident.id] === 'false_positive'
                          ? 'bg-rose-950 text-rose-400 border-rose-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="False Positive"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span className="text-[10px]">False Positive</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
