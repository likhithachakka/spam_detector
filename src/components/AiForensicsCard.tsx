import React from 'react';
import { AiForensicResult } from '../types.ts';
import { Bot, Shield, AlertOctagon, Brain, Crosshair, CheckCircle2, Cpu } from 'lucide-react';

interface AiForensicsCardProps {
  forensics?: AiForensicResult;
  isLoading?: boolean;
}

export const AiForensicsCard: React.FC<AiForensicsCardProps> = ({ forensics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800" />
          <div className="h-4 bg-slate-800 rounded w-48" />
        </div>
        <div className="h-16 bg-slate-800/60 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-800/40 rounded-xl" />
          <div className="h-20 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!forensics) {
    return null;
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">
                Gemini AI Deep Threat Forensics
              </h3>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                  forensics.isGeneratedByAi
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {forensics.isGeneratedByAi ? 'Gemini 3.8 Flash' : 'Signature Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Threat Category: <strong className="text-slate-200">{forensics.category}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${getThreatColor(forensics.threatLevel)}`}>
            {forensics.threatLevel} Threat
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {forensics.confidenceScore}% AI Confidence
          </span>
        </div>
      </div>

      {/* Forensic Summary */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
        <strong className="text-slate-100 block mb-1">Executive Summary:</strong>
        {forensics.summary}
      </div>

      {/* Tactics, Psychological Levers & IOCs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tactics */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Attack Tactics</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {forensics.tacticsDetected.length > 0 ? (
              forensics.tacticsDetected.map((tactic, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]"
                >
                  {tactic}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">None detected</span>
            )}
          </div>
        </div>

        {/* Psychological Triggers */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Cognitive Exploits</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {forensics.psychologicalTriggers.length > 0 ? (
              forensics.psychologicalTriggers.map((trigger, idx) => (
                <span
                  key={idx}
                  className="bg-purple-950/40 border border-purple-900/40 text-purple-300 px-2 py-0.5 rounded text-[11px]"
                >
                  {trigger}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">None detected</span>
            )}
          </div>
        </div>

        {/* IOCs (Indicators of Compromise) */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discovered IOCs</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {forensics.iocs.length > 0 ? (
              forensics.iocs.map((ioc, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 border border-slate-700 font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded truncate max-w-full"
                  title={ioc}
                >
                  {ioc}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No malicious IOCs identified</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-3 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-cyan-300">Security Recommendation: </span>
          <span className="text-slate-300">{forensics.recommendedAction}</span>
        </div>
      </div>
    </div>
  );
};
