import React, { useState } from 'react';
import { NaiveBayesResult, TokenContribution } from '../types.ts';
import { Info, Sparkles, Filter, Copy, Check } from 'lucide-react';

interface InteractiveTextHighlighterProps {
  content: string;
  naiveBayes: NaiveBayesResult;
}

export const InteractiveTextHighlighter: React.FC<InteractiveTextHighlighterProps> = ({
  content,
  naiveBayes,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'spam' | 'ham' | 'raw'>('all');
  const [hoveredToken, setHoveredToken] = useState<TokenContribution | null>(null);
  const [copied, setCopied] = useState(false);

  // Map words to token contributions for quick lookup
  const tokenMap = new Map<string, TokenContribution>();
  
  for (const t of naiveBayes.topSpamTokens) {
    tokenMap.set(t.word.toLowerCase(), t);
  }
  for (const t of naiveBayes.topHamTokens) {
    tokenMap.set(t.word.toLowerCase(), t);
  }

  // Also map any tokens in allTokens that have noticeable weight
  for (const t of naiveBayes.allTokens) {
    if (!tokenMap.has(t.word.toLowerCase()) && Math.abs(t.spamWeight) > 0.4) {
      tokenMap.set(t.word.toLowerCase(), {
        word: t.word,
        weight: t.spamWeight,
        spamFrequency: t.spamWeight > 0 ? 5 : 0,
        hamFrequency: t.spamWeight < 0 ? 5 : 0,
        countInText: 1,
      });
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render text segments
  const renderInteractiveText = () => {
    if (filterMode === 'raw') {
      return (
        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
          {content}
        </pre>
      );
    }

    // Split text into tokens while preserving whitespace & punctuation
    const words = content.split(/(\s+|[.,!?;:"'()[\]{}<>]+)/);

    return (
      <div className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
        {words.map((chunk, index) => {
          const cleanWord = chunk.toLowerCase().trim();
          const tokenInfo = tokenMap.get(cleanWord);

          if (!tokenInfo) {
            return <span key={index}>{chunk}</span>;
          }

          const isSpam = tokenInfo.weight > 0;
          const isHam = tokenInfo.weight < 0;

          if (filterMode === 'spam' && !isSpam) {
            return <span key={index}>{chunk}</span>;
          }
          if (filterMode === 'ham' && !isHam) {
            return <span key={index}>{chunk}</span>;
          }

          return (
            <span
              key={index}
              onMouseEnter={() => setHoveredToken(tokenInfo)}
              onMouseLeave={() => setHoveredToken(null)}
              className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 inline-block font-medium ${
                isSpam
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border-b-2 border-rose-500'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border-b-2 border-emerald-500'
              }`}
            >
              {chunk}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Interactive Token & Feature Decomposition
          </h3>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            Hover to inspect weights
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilterMode('spam')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterMode === 'spam'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spam Triggers
            </button>
            <button
              onClick={() => setFilterMode('ham')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterMode === 'ham'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ham / Clean
            </button>
            <button
              onClick={() => setFilterMode('raw')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterMode === 'raw'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
            title="Copy text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Text Content Box */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/70 max-h-80 overflow-y-auto relative">
        {renderInteractiveText()}
      </div>

      {/* Tooltip / Token Inspector Card */}
      <div className="min-h-12 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
        {hoveredToken ? (
          <div className="flex flex-wrap items-center gap-4 w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Token:</span>
              <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                "{hoveredToken.word}"
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Log-Odds Weight:</span>
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                  hoveredToken.weight > 0
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {hoveredToken.weight > 0 ? `+${hoveredToken.weight}` : hoveredToken.weight}
              </span>
              <span className="text-[11px] text-slate-500">
                ({hoveredToken.weight > 0 ? 'Pushes toward SPAM' : 'Pushes toward HAM'})
              </span>
            </div>

            <div className="text-[11px] text-slate-400 ml-auto">
              Corpus frequency: <span className="text-rose-400 font-mono">{hoveredToken.spamFrequency} spam</span> vs{' '}
              <span className="text-emerald-400 font-mono">{hoveredToken.hamFrequency} ham</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Hover over colored words above to inspect their mathematical Naive Bayes weight and corpus frequency.
            </span>
          </div>
        )}
      </div>

      {/* Top Indicators Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Top Spam words */}
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3">
          <div className="text-xs font-semibold text-rose-300 flex items-center justify-between mb-2">
            <span>Primary Spam Indicators</span>
            <span className="text-[10px] text-rose-400/80">Weight contribution</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {naiveBayes.topSpamTokens.length > 0 ? (
              naiveBayes.topSpamTokens.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  {t.word}
                  <span className="text-rose-400 font-bold">+{t.weight}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No significant spam words identified.</span>
            )}
          </div>
        </div>

        {/* Top Ham words */}
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3">
          <div className="text-xs font-semibold text-emerald-300 flex items-center justify-between mb-2">
            <span>Primary Clean/Ham Indicators</span>
            <span className="text-[10px] text-emerald-400/80">Weight contribution</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {naiveBayes.topHamTokens.length > 0 ? (
              naiveBayes.topHamTokens.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  {t.word}
                  <span className="text-emerald-400 font-bold">{t.weight}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No significant ham markers found.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
