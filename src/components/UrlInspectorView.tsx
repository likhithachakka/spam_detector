import React, { useState } from 'react';
import { Link2, Search, AlertTriangle, CheckCircle2, ShieldAlert, Globe, Server, ExternalLink } from 'lucide-react';
import { DetectedUrl } from '../types.ts';

export const UrlInspectorView: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectedUrl | null>(null);

  const handleScanUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsScanning(true);
    try {
      const res = await fetch('/api/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(`URL scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const loadExampleUrl = (url: string) => {
    setInputUrl(url);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Phishing URL & Link Inspector</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect suspicious hyper-links for typo-squatting, dangerous TLDs, and redirection deception.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
        <form onSubmit={handleScanUrl} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL to inspect (e.g. http://secure-paypal-verify.xyz/login)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            required
          />
          <button
            type="submit"
            disabled={isScanning || !inputUrl.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Inspecting...' : 'Scan URL'}
          </button>
        </form>

        {/* Quick test chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span>Try quick samples:</span>
          <button
            onClick={() => loadExampleUrl('http://secure-paypal-login-verify.xyz/auth')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono text-[11px]"
          >
            paypal-verify.xyz
          </button>
          <button
            onClick={() => loadExampleUrl('http://bit.ly/bank-unlock-pin')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
          >
            bit.ly/bank-unlock
          </button>
          <button
            onClick={() => loadExampleUrl('https://github.com/company/frontend-app/pull/84')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px]"
          >
            github.com/pull/84
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Forensic Link Evaluation</h3>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                result.isSuspicious
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {result.isSuspicious ? 'High Risk Phishing Indicator' : 'Benign / Clean Domain'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">Target Hostname</span>
              <span className="font-mono text-xs font-bold text-slate-100 truncate">
                {result.domain || 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">Threat Flags</span>
              <span className="font-mono text-xs font-bold text-slate-100">
                {result.threatReasons.length} active risk markers
              </span>
            </div>
          </div>

          {result.threatReasons.length > 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Detected Security Violations:
              </span>
              {result.threatReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300 font-medium"
                >
                  {reason}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>No known malicious indicators, suspicious TLDs, or brand spoofing detected in this link.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
