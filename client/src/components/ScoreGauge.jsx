import React from 'react';

export const ScoreGauge = ({ score = 0, size = 180, strokeWidth = 14, subtitle = 'Deterministic Trust Score' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 90) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', label: 'EXCELLENT', textClass: 'text-emerald-400' };
    if (s >= 80) return { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)', label: 'HIGH', textClass: 'text-cyan-400' };
    if (s >= 70) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', label: 'MODERATE', textClass: 'text-amber-400' };
    if (s >= 50) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.3)', label: 'LOW', textClass: 'text-orange-400' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', label: 'CRITICAL', textClass: 'text-rose-400' };
  };

  const { stroke, glow, label, textClass } = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Value track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 10px ${glow})`,
          }}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-4xl font-extrabold tracking-tight font-mono ${textClass}`}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 mt-0.5">
          {label}
        </span>
      </div>
      {subtitle && (
        <span className="text-xs text-slate-400 mt-2 font-mono tracking-wide">{subtitle}</span>
      )}
    </div>
  );
};
