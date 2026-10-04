import React from 'react';
import { HeuristicRuleConfig } from '../types.ts';
import { ShieldCheck, ToggleLeft, ToggleRight, Sliders, AlertTriangle } from 'lucide-react';

interface RulesManagerViewProps {
  rules: HeuristicRuleConfig[];
  enabledRuleIds: string[];
  onToggleRule: (id: string) => void;
  onResetRules: () => void;
}

export const RulesManagerView: React.FC<RulesManagerViewProps> = ({
  rules,
  enabledRuleIds,
  onToggleRule,
  onResetRules,
}) => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Heuristic Security Rules Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure active threat detection heuristics, weight penalties, and regex signatures.
            </p>
          </div>
        </div>

        <button
          onClick={onResetRules}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Enable All Rules ({rules.length})
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isEnabled = enabledRuleIds.includes(rule.id);
          const isCritical = rule.severity === 'critical';
          const isHigh = rule.severity === 'high';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isEnabled
                  ? 'bg-slate-900/90 border-slate-800 shadow-sm'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : isHigh
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {rule.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    title={isEnabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-1">{rule.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{rule.id}</span>
                <span className="font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  +{rule.score} Score Penalty
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
