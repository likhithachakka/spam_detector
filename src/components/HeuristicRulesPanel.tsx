import React from 'react';
import { HeuristicRuleMatch, DetectedUrl } from '../types.ts';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Link2, CheckCircle2 } from 'lucide-react';

interface HeuristicRulesPanelProps {
  totalScore: number;
  rulesTriggered: HeuristicRuleMatch[];
  detectedUrls: DetectedUrl[];
  headerFlags: string[];
}

export const HeuristicRulesPanel: React.FC<HeuristicRulesPanelProps> = ({
  totalScore,
  rulesTriggered,
  detectedUrls,
  headerFlags,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Heuristic Rule Engine & Threat Signatures
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Rules Triggered:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded ${
              rulesTriggered.length > 0
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {rulesTriggered.length}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Heuristic Score:</span>
          <span className="font-mono font-bold text-slate-200">{totalScore}/100</span>
        </div>
      </div>

      {/* Rules List */}
      <div className="flex flex-col gap-2.5">
        {rulesTriggered.length > 0 ? (
          rulesTriggered.map((rule) => {
            const isCritical = rule.severity === 'critical';
            const isHigh = rule.severity === 'high';

            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                    : isHigh
                    ? 'bg-orange-950/20 border-orange-900/40 text-orange-200'
                    : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isHigh
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{rule.name}</span>
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded">
                    +{rule.scoreContribution} pts
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {rule.description}
                </p>

                {/* Matched Snippets */}
                {rule.matchedSnippets.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 font-medium">Matched:</span>
                    {rule.matchedSnippets.map((snippet, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900/90 text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700/60"
                      >
                        "{snippet}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Clean scan: Zero deceptive or high-risk heuristic threat signatures triggered.</span>
          </div>
        )}
      </div>

      {/* Detected URLs & Header flags */}
      {(detectedUrls.length > 0 || headerFlags.length > 0) && (
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Extracted Links & Header Analysis</span>
          </div>

          {headerFlags.map((flag, idx) => (
            <div
              key={idx}
              className="text-xs bg-rose-950/20 border border-rose-900/30 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{flag}</span>
            </div>
          ))}

          {detectedUrls.map((urlItem, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                urlItem.isSuspicious
                  ? 'bg-rose-950/20 border-rose-900/30'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-cyan-300 truncate text-[11px]">
                  {urlItem.url}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                    urlItem.isSuspicious
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {urlItem.isSuspicious ? 'Suspicious' : 'Clean'}
                </span>
              </div>

              {urlItem.threatReasons.length > 0 && (
                <div className="text-[11px] text-rose-400 flex flex-wrap gap-1 mt-0.5">
                  {urlItem.threatReasons.map((reason, rIdx) => (
                    <span key={rIdx} className="bg-rose-500/10 px-1.5 py-0.5 rounded">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
