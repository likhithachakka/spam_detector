import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame } from 'lucide-react';
import { ClassificationLabel } from '../types.ts';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  label: ClassificationLabel;
  confidence: number;
  riskLevel: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  confidence,
  riskLevel,
}) => {
  // SVG circumference math
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc over 240 degrees (leaving 120 deg open at bottom)
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  const getColorTheme = () => {
    if (score >= 70) {
      return {
        stroke: '#f43f5e', // rose-500
        bgGlow: 'rgba(244, 63, 94, 0.25)',
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        text: 'text-rose-400',
        icon: ShieldAlert,
      };
    }
    if (score >= 40) {
      return {
        stroke: '#f59e0b', // amber-500
        bgGlow: 'rgba(245, 158, 11, 0.25)',
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        text: 'text-amber-400',
        icon: AlertTriangle,
      };
    }
    return {
      stroke: '#10b981', // emerald-500
      bgGlow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
      icon: ShieldCheck,
    };
  };

  const theme = getColorTheme();
  const IconComponent = theme.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: theme.bgGlow }}
      />

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-135"
        >
          {/* Base track */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          {/* Dynamic Score Arc */}
          <motion.circle
            stroke={theme.stroke}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Spam Score
          </span>
          <div className="flex items-baseline gap-0.5">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-extrabold tracking-tight ${theme.text}`}
            >
              {score}
            </motion.span>
            <span className="text-sm font-medium text-slate-500">/100</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
            {confidence}% Conf.
          </span>
        </div>
      </div>

      {/* Verdict badge */}
      <div className="mt-2 flex flex-col items-center gap-1.5 w-full">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${theme.badgeBg}`}
        >
          <IconComponent className="w-4 h-4" />
          <span>
            {label === 'SPAM'
              ? 'SPAM / THREAT DETECTED'
              : label === 'SUSPICIOUS'
              ? 'SUSPICIOUS CONTENT'
              : 'CLEAN / LEGITIMATE'}
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Threat Rating: <strong className="text-slate-200">{riskLevel}</strong>
        </span>
      </div>
    </div>
  );
};
