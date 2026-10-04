import React, { useState } from 'react';
import { Layers, Play, Download, Sparkles, Filter, Eye, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ClassificationReport } from '../types.ts';

interface BatchItemResult {
  id: string;
  title: string;
  preview: string;
  score: number;
  label: 'SPAM' | 'HAM' | 'SUSPICIOUS';
  triggeredRulesCount: number;
  topSpamWord: string | null;
}

interface BatchSummary {
  total: number;
  spamCount: number;
  hamCount: number;
  suspiciousCount: number;
  averageSpamScore: number;
  spamRatioPercent: number;
}

interface BatchScannerViewProps {
  onInspectItem: (content: string, subject?: string) => void;
}

const PRESET_BATCH_DATA = [
  {
    title: "PayPal Security Lockout Alert",
    content: "URGENT: Your PayPal account has been temporarily restricted due to unauthorized login attempts. Click here to verify identity: http://paypal-verify-account.xyz",
  },
  {
    title: "Quarterly Engineering Roadmap Meeting",
    content: "Hi team, please find attached the agenda for tomorrow's sprint review at 10 AM. We will review our performance metrics and database migration plan.",
  },
  {
    title: "Unclaimed Inheritance $14.2M",
    content: "Dear friend, I am Barrister Andrew Johnson representing a deceased client with $14.2M unclaimed funds. Provide your banking details for 40% share.",
  },
  {
    title: "Delta Flight Booking Confirmation",
    content: "Your electronic ticket receipt for Delta Flight 1492 from SFO to JFK is confirmed. Confirmation code #H7Y4KL. Departure 8:15 AM.",
  },
  {
    title: "USPS Smishing Parcel Fee",
    content: "[USPS Delivery Alert]: Package #US9481 could not be delivered due to unpaid redelivery fee of $1.95. Settle fee at http://bit.ly/usps-package-fee",
  },
  {
    title: "Crypto ETH & BTC Doubling Giveaway",
    content: "Elon Musk Binance Community Giveaway! Send 0.1 BTC to receive 0.3 BTC back instantly. Claim at http://elon-airdrop.live",
  },
  {
    title: "GitHub Pull Request Review",
    content: "Sarah requested your review on Pull Request #84 'Add dark mode toggle and improve accessibility'. All CI tests passed.",
  },
  {
    title: "CEO Urgent Request - Gift Cards",
    content: "Are you in the office right now? I need you to purchase 5 Apple gift cards of $200 each for a client gift. Do not call, send codes here.",
  }
];

export const BatchScannerView: React.FC<BatchScannerViewProps> = ({ onInspectItem }) => {
  const [rawInput, setRawInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [results, setResults] = useState<BatchItemResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'spam' | 'ham'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPresetBatch = () => {
    const formatted = PRESET_BATCH_DATA.map((item, idx) => `[Message ${idx + 1}] ${item.content}`).join('\n---\n');
    setRawInput(formatted);
  };

  const handleRunBatchScan = async () => {
    if (!rawInput.trim()) return;

    setIsScanning(true);
    try {
      // Split by separator '---' or newlines if multiple messages
      const rawItems = rawInput
        .split(/(?:\r?\n---\r?\n|\r?\n\r?\n)/)
        .map(t => t.trim())
        .filter(t => t.length > 5);

      const items = (rawItems.length > 0 ? rawItems : [rawInput]).map((text, idx) => ({
        id: `batch-${idx + 1}`,
        title: text.slice(0, 40) + '...',
        content: text,
      }));

      const res = await fetch('/api/batch-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch scan failed');

      setSummary(data.summary);
      setResults(data.results);
    } catch (err: any) {
      alert(`Batch scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['ID', 'Title', 'Verdict', 'SpamScore', 'TriggeredRules', 'PrimarySpamSignal'];
    const rows = results.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.label,
      r.score,
      r.triggeredRulesCount,
      r.topSpamWord || 'None'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinelspam-batch-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(r => {
    if (filter === 'spam' && r.label !== 'SPAM') return false;
    if (filter === 'ham' && r.label !== 'HAM') return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase()) && !r.preview.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Batch Message Classifier</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bulk triage incoming mail streams, SMS lists, and incident logs with ensemble scoring.
            </p>
          </div>
        </div>

        <button
          onClick={loadPresetBatch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Load Benchmark 8-Message Suite
        </button>
      </div>

      {/* Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Separate multiple messages using <code className="text-cyan-400 font-mono">---</code> on its own line:</span>
          <span>Max 100 items per batch</span>
        </div>

        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`Paste messages here separated by "---":\n\nURGENT: Verify your PayPal account at http://phish-link.xyz\n---\nHi Sarah, here is the roadmap presentation for Monday's meeting.\n---\nCONGRATULATIONS you have won $5,000,000! Reply with banking info.`}
          rows={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
        />

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={handleRunBatchScan}
            disabled={isScanning || !rawInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Classifying Batch...' : 'Run Batch Analysis'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col">
            <span className="text-xs text-slate-400">Total Scanned</span>
            <span className="text-2xl font-bold text-slate-100 mt-1">{summary.total}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col">
            <span className="text-xs text-rose-400">Spam / Phishing</span>
            <span className="text-2xl font-bold text-rose-400 mt-1">{summary.spamCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col">
            <span className="text-xs text-amber-400">Suspicious</span>
            <span className="text-2xl font-bold text-amber-400 mt-1">{summary.suspiciousCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col">
            <span className="text-xs text-emerald-400">Clean / Ham</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">{summary.hamCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col">
            <span className="text-xs text-cyan-400">Avg Spam Score</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1">{summary.averageSpamScore}%</span>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter results..."
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setFilter('spam')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    filter === 'spam' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
                  }`}
                >
                  Spam
                </button>
                <button
                  onClick={() => setFilter('ham')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    filter === 'ham' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  Clean
                </button>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Verdict</th>
                  <th className="py-2.5 px-3 font-semibold">Spam Score</th>
                  <th className="py-2.5 px-3 font-semibold">Message Preview</th>
                  <th className="py-2.5 px-3 font-semibold">Rules Hit</th>
                  <th className="py-2.5 px-3 font-semibold">Key Token</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredResults.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item.label === 'SPAM'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : item.label === 'SUSPICIOUS'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{item.score}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.score >= 60
                                ? 'bg-rose-500'
                                : item.score >= 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-300">
                      {item.preview}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {item.triggeredRulesCount > 0 ? (
                        <span className="text-orange-400 font-semibold">{item.triggeredRulesCount} rules</span>
                      ) : (
                        <span className="text-slate-500">0 rules</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {item.topSpamWord ? (
                        <span className="text-rose-400">"{item.topSpamWord}"</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onInspectItem(item.preview, item.title)}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold bg-cyan-950/30 hover:bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/40 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
