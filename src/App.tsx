import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar.tsx';
import { ScoreGauge } from './components/ScoreGauge.tsx';
import { InteractiveTextHighlighter } from './components/InteractiveTextHighlighter.tsx';
import { AiForensicsCard } from './components/AiForensicsCard.tsx';
import { HeuristicRulesPanel } from './components/HeuristicRulesPanel.tsx';
import { ModelLabView } from './components/ModelLabView.tsx';
import { BatchScannerView } from './components/BatchScannerView.tsx';
import { RulesManagerView } from './components/RulesManagerView.tsx';
import { UrlInspectorView } from './components/UrlInspectorView.tsx';
import { HistoryModal } from './components/HistoryDrawer.tsx';

import {
  ClassificationReport,
  ModelMetrics,
  SampleEmail,
  HeuristicRuleConfig,
} from './types.ts';

import {
  Search,
  Sparkles,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Share2,
  Check,
  Bot,
  Mail,
  User,
  Zap,
  Clock,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('scanner');
  const [inputContent, setInputContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [threshold, setThreshold] = useState(50);
  const [isScanning, setIsScanning] = useState(false);
  const [currentReport, setCurrentReport] = useState<ClassificationReport | null>(null);

  const [presets, setPresets] = useState<SampleEmail[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [rules, setRules] = useState<HeuristicRuleConfig[]>([]);
  const [enabledRuleIds, setEnabledRuleIds] = useState<string[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);

  const [history, setHistory] = useState<ClassificationReport[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Load initial presets, rules, and model metrics on mount
  useEffect(() => {
    fetchPresets();
    fetchRules();
    fetchModelMetrics();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      setPresets(data);
      // Auto-load first sample if empty
      if (data && data.length > 0 && !inputContent) {
        loadPreset(data[0]);
      }
    } catch (err) {
      console.error('Failed to load sample presets:', err);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(data);
      setEnabledRuleIds(data.map((r: HeuristicRuleConfig) => r.id));
    } catch (err) {
      console.error('Failed to load heuristic rules:', err);
    }
  };

  const fetchModelMetrics = async () => {
    try {
      const res = await fetch('/api/model-stats');
      const data = await res.json();
      setModelMetrics(data);
    } catch (err) {
      console.error('Failed to load model metrics:', err);
    }
  };

  const loadPreset = (preset: SampleEmail) => {
    setSelectedPresetId(preset.id);
    setInputContent(preset.content);
    setSubject(preset.subject);
    setSender(preset.sender);
    setFeedbackGiven(false);
  };

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() && !subject.trim()) return;

    setIsScanning(true);
    setFeedbackGiven(false);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent,
          subject,
          sender,
          useAi,
          threshold,
          enabledRules: enabledRuleIds,
        }),
      });

      const report: ClassificationReport = await res.json();
      if (!res.ok) {
        throw new Error((report as any).error || 'Classification failed');
      }

      setCurrentReport(report);
      setHistory((prev) => [report, ...prev].slice(0, 30));
    } catch (err: any) {
      alert(`Classification error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleRule = (id: string) => {
    setEnabledRuleIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleResetRules = () => {
    setEnabledRuleIds(rules.map((r) => r.id));
  };

  const handleClearInputs = () => {
    setInputContent('');
    setSubject('');
    setSender('');
    setSelectedPresetId('');
    setCurrentReport(null);
    setFeedbackGiven(false);
  };

  const handleExportJSON = () => {
    if (!currentReport) return;
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelspam-report-${currentReport.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyForensicSummary = () => {
    if (!currentReport) return;
    const text = `SentinelSpam Security Verdict:
Verdict: ${currentReport.finalLabel} (Spam Score: ${currentReport.overallSpamScore}/100)
Confidence: ${currentReport.confidence}% | Risk Level: ${currentReport.riskLevel}
Triggered Rules: ${currentReport.heuristics.rulesTriggered.map((r) => r.name).join(', ') || 'None'}
AI Assessment: ${currentReport.aiForensics?.category || 'Standard'}
Recommendation: ${currentReport.aiForensics?.recommendedAction || 'Normal hygiene'}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleReportFeedback = async (correctedLabel: 'spam' | 'ham') => {
    try {
      const textToTrain = `${subject ? subject + ' ' : ''}${inputContent}`;
      await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTrain, label: correctedLabel }),
      });
      setFeedbackGiven(true);
      fetchModelMetrics();
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  // Inspect item from Batch view
  const handleInspectFromBatch = (content: string, subj?: string) => {
    setInputContent(content);
    setSubject(subj || '');
    setCurrentTab('scanner');
    setTimeout(() => {
      handleClassify();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'batch' && (
          <BatchScannerView onInspectItem={handleInspectFromBatch} />
        )}

        {currentTab === 'model-lab' && (
          <ModelLabView
            metrics={modelMetrics}
            onRefreshMetrics={fetchModelMetrics}
          />
        )}

        {currentTab === 'rules' && (
          <RulesManagerView
            rules={rules}
            enabledRuleIds={enabledRuleIds}
            onToggleRule={handleToggleRule}
            onResetRules={handleResetRules}
          />
        )}

        {currentTab === 'url-inspector' && <UrlInspectorView />}

        {currentTab === 'scanner' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
            {/* Top Quick Load Presets Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300">
                  Quick Benchmark Samples:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      selectedPresetId === preset.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                        preset.type === 'spam' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Parameters Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message Composer / Input Form */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      Message Content & Headers
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearInputs}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Sender & Subject inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      placeholder="Sender (e.g. security@paypal-verify.xyz)"
                      className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject Line (e.g. URGENT: Account Suspension)"
                      className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Message Body Textarea */}
                <div className="relative">
                  <textarea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Paste or type email body, SMS text, or suspicious DM here..."
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono resize-y"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono pointer-events-none">
                    {inputContent.length} chars •{' '}
                    {inputContent.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                {/* Scan Button & Configuration Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-xs">
                    {/* Gemini AI Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useAi}
                        onChange={(e) => setUseAi(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-950"
                      />
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        Gemini AI Forensics
                      </span>
                    </label>

                    {/* Active Rules Indicator */}
                    <span className="text-slate-400 hidden sm:inline">
                      Rules: <strong className="text-slate-200">{enabledRuleIds.length}</strong>/{rules.length} active
                    </span>
                  </div>

                  <button
                    onClick={() => handleClassify()}
                    disabled={isScanning || (!inputContent.trim() && !subject.trim())}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'Analyzing Threat Vectors...' : 'Scan & Classify Message'}
                  </button>
                </div>
              </div>

              {/* Side Configuration & Live Gauge */}
              <div className="flex flex-col gap-4">
                {/* Score Gauge Widget */}
                {currentReport ? (
                  <ScoreGauge
                    score={currentReport.overallSpamScore}
                    label={currentReport.finalLabel}
                    confidence={currentReport.confidence}
                    riskLevel={currentReport.riskLevel}
                  />
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 backdrop-blur-md min-h-64">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        Awaiting Classification
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Select a sample preset above or paste an email/SMS to run statistical and AI threat analysis.
                      </p>
                    </div>
                  </div>
                )}

                {/* Threshold Slider Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      Classification Sensitivity
                    </span>
                    <span className="font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {threshold}% Strictness
                    </span>
                  </div>

                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={5}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Permissive (20%)</span>
                    <span>Balanced (50%)</span>
                    <span>Aggressive (80%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification Report Section (When Available) */}
            {currentReport && (
              <div className="flex flex-col gap-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Scan ID:</span>
                    <span className="font-mono text-xs text-slate-300 font-semibold bg-slate-950 px-2 py-0.5 rounded">
                      {currentReport.id}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {currentReport.processingTimeMs}ms execution
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyForensicSummary}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      {copiedSummary ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Score Breakdown Multi-Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Naive Bayes Score */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      1. Statistical Naive Bayes
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-cyan-400">
                        {Math.round(currentReport.naiveBayes.spamProbability * 100)}%
                      </span>
                      <span className="text-xs text-slate-500">spam probability</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Log-Odds: {currentReport.naiveBayes.rawLogOdds} • Tokens:{' '}
                      {currentReport.naiveBayes.allTokens.length}
                    </div>
                  </div>

                  {/* Heuristic Rules Score */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      2. Heuristic Security Rules
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-orange-400">
                        {currentReport.heuristics.totalScore}/100
                      </span>
                      <span className="text-xs text-slate-500">threat score</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentReport.heuristics.rulesTriggered.length} signature rule(s) triggered
                    </div>
                  </div>

                  {/* AI Forensics Category */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      3. Gemini AI Threat Intel
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-purple-300 truncate">
                        {currentReport.aiForensics?.category || 'Standard Heuristics'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Threat Tier:{' '}
                      <strong className="text-slate-200 uppercase">
                        {currentReport.aiForensics?.threatLevel || 'Clean'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Card */}
                <AiForensicsCard
                  forensics={currentReport.aiForensics}
                  isLoading={isScanning}
                />

                {/* Interactive Token Decomposition */}
                <InteractiveTextHighlighter
                  content={currentReport.inputContent}
                  naiveBayes={currentReport.naiveBayes}
                />

                {/* Heuristic Rules Panel */}
                <HeuristicRulesPanel
                  totalScore={currentReport.heuristics.totalScore}
                  rulesTriggered={currentReport.heuristics.rulesTriggered}
                  detectedUrls={currentReport.heuristics.detectedUrls}
                  headerFlags={currentReport.heuristics.headerFlags}
                />

                {/* Feedback / Model Correction Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">
                      Did the classifier get this right?
                    </span>
                    <span className="text-slate-400 hidden sm:inline">
                      Submit ground-truth feedback to retrain the local model weights:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {feedbackGiven ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Feedback recorded! Model updated.
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReportFeedback('spam')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                        >
                          Mark as Definite Spam
                        </button>
                        <button
                          onClick={() => handleReportFeedback('ham')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        >
                          Mark as Clean / Ham
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectReport={(report) => {
          setCurrentReport(report);
          setInputContent(report.inputContent);
          setSubject(report.subject || '');
          setSender(report.sender || '');
          setCurrentTab('scanner');
        }}
        onClearHistory={() => setHistory([])}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        SentinelSpam • Intelligent Threat & Phishing Detection Engine
      </footer>
    </div>
  );
}
