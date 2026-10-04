import React, { useState } from 'react';
import { ModelMetrics } from '../types.ts';
import {
  BarChart3,
  Database,
  BrainCircuit,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ModelLabViewProps {
  metrics: ModelMetrics | null;
  onRefreshMetrics: () => void;
}

export const ModelLabView: React.FC<ModelLabViewProps> = ({ metrics, onRefreshMetrics }) => {
  const [trainText, setTrainText] = useState('');
  const [trainLabel, setTrainLabel] = useState<'spam' | 'ham'>('spam');
  const [isTraining, setIsTraining] = useState(false);
  const [trainSuccessMessage, setTrainSuccessMessage] = useState<string | null>(null);
  const [trainErrorMessage, setTrainErrorMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainText.trim()) return;

    setIsTraining(true);
    setTrainSuccessMessage(null);
    setTrainErrorMessage(null);

    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trainText, label: trainLabel }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Training failed');
      }

      setTrainSuccessMessage(
        `Success: Model weights updated. Added sample as ${trainLabel.toUpperCase()}. Current vocabulary: ${data.metrics?.vocabularySize || 'Updated'}`
      );
      setTrainText('');
      onRefreshMetrics();
    } catch (err: any) {
      setTrainErrorMessage(err.message || 'Error updating model');
    } finally {
      setIsTraining(false);
    }
  };

  const handleResetModel = async () => {
    if (!window.confirm('Reset Naive Bayes classifier weights to initial seed dataset?')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-model', { method: 'POST' });
      if (res.ok) {
        setTrainSuccessMessage('Classifier reset to default benchmark weights.');
        onRefreshMetrics();
      }
    } catch (err: any) {
      setTrainErrorMessage(err.message || 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Loading statistical model telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Machine Learning Model Laboratory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Multinomial Naive Bayes classifier with Laplace smoothing, log-odds feature weights, and online learning.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetModel}
          disabled={isResetting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          Reset Baseline
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Validation Accuracy</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-cyan-400">{metrics.accuracy}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Cross-tested on benchmark</span>
        </div>

        {/* Precision */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Precision (Spam)</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{metrics.precision}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Low false-positive rate</span>
        </div>

        {/* Recall */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Recall (Sensitivity)</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-purple-400">{metrics.recall}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Catches malicious variants</span>
        </div>

        {/* F1 Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Harmonic F1 Score</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-blue-400">{metrics.f1Score}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Balanced metric</span>
        </div>
      </div>

      {/* Dataset & Vocabulary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{metrics.vocabularySize}</div>
            <div className="text-xs text-slate-400">Unique Vocabulary Features</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{metrics.spamSamplesCount}</div>
            <div className="text-xs text-slate-400">Trained Spam Documents</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{metrics.hamSamplesCount}</div>
            <div className="text-xs text-slate-400">Trained Ham / Clean Documents</div>
          </div>
        </div>
      </div>

      {/* Word Weights Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Spam Words */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-semibold text-slate-100">
                Top Spam Indicator Tokens
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Log-odds ratio</span>
          </div>

          <div className="flex flex-col gap-2">
            {metrics.topSpamWords.map((token, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono w-5">{idx + 1}.</span>
                  <span className="font-mono text-slate-200 font-medium">"{token.word}"</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, token.score * 20)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-rose-400 w-12 text-right">
                    +{token.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ham Words */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-100">
                Top Clean / Ham Indicator Tokens
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Log-odds ratio</span>
          </div>

          <div className="flex flex-col gap-2">
            {metrics.topHamWords.map((token, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono w-5">{idx + 1}.</span>
                  <span className="font-mono text-slate-200 font-medium">"{token.word}"</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(token.score) * 20)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-emerald-400 w-12 text-right">
                    {token.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online Learning / Training Workbench */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Online Learning & Continuous Model Retraining
              </h3>
              <p className="text-xs text-slate-400">
                Teach the model new phishing techniques or safe workplace lingo in real time.
              </p>
            </div>
          </div>
        </div>

        {trainSuccessMessage && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{trainSuccessMessage}</span>
          </div>
        )}

        {trainErrorMessage && (
          <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{trainErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleTrainSubmit} className="flex flex-col gap-3">
          <textarea
            value={trainText}
            onChange={(e) => setTrainText(e.target.value)}
            placeholder="Paste training sample message or email here (e.g. 'URGENT: Verify your invoice payment at http://fake-link.xyz')..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Ground Truth Label:</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="label"
                  checked={trainLabel === 'spam'}
                  onChange={() => setTrainLabel('spam')}
                  className="text-rose-500 focus:ring-rose-500"
                />
                <span className="text-rose-400 font-semibold">Spam / Phishing</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="label"
                  checked={trainLabel === 'ham'}
                  onChange={() => setTrainLabel('ham')}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-emerald-400 font-semibold">Ham / Legitimate</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isTraining || !trainText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isTraining ? 'Updating Weights...' : 'Train Model Sample'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
