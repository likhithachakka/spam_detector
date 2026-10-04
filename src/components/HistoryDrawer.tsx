import React from 'react';
import { ClassificationReport } from '../types.ts';
import { History, X, Trash2, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ClassificationReport[];
  onSelectReport: (report: ClassificationReport) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Scan Activity Log ({history.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors text-xs flex items-center gap-1"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-2.5">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No scans performed yet in this session.
            </div>
          ) : (
            history.map((scan) => (
              <div
                key={scan.id}
                onClick={() => {
                  onSelectReport(scan);
                  onClose();
                }}
                className="p-3 bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="shrink-0">
                    {scan.finalLabel === 'SPAM' ? (
                      <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                        S
                      </span>
                    ) : scan.finalLabel === 'SUSPICIOUS' ? (
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        ?
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        H
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-slate-200 truncate">
                      {scan.subject || scan.inputContent.slice(0, 45) + '...'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(scan.timestamp).toLocaleTimeString()} • Score: {scan.overallSpamScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scan.finalLabel === 'SPAM'
                        ? 'bg-rose-500/20 text-rose-300'
                        : scan.finalLabel === 'SUSPICIOUS'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {scan.finalLabel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
