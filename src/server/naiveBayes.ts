import { DatasetItem, INITIAL_TRAINING_DATA, TEST_BENCHMARK_DATA } from './dataset.ts';
import { ModelMetrics, NaiveBayesResult, TokenContribution } from './types.ts';

// Standard English stop words to soften or filter so model focuses on discriminative features
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export class NaiveBayesClassifier {
  private spamWordCounts: Map<string, number> = new Map();
  private hamWordCounts: Map<string, number> = new Map();
  private totalSpamWords: number = 0;
  private totalHamWords: number = 0;
  private vocabulary: Set<string> = new Set();
  
  private totalSpamDocs: number = 0;
  private totalHamDocs: number = 0;
  private laplaceAlpha: number = 1.0;
  private lastTrainedTimestamp: string = new Date().toISOString();

  constructor() {
    this.initialize();
  }

  public initialize(dataset: DatasetItem[] = INITIAL_TRAINING_DATA): void {
    this.spamWordCounts.clear();
    this.hamWordCounts.clear();
    this.totalSpamWords = 0;
    this.totalHamWords = 0;
    this.vocabulary.clear();
    this.totalSpamDocs = 0;
    this.totalHamDocs = 0;

    for (const item of dataset) {
      this.train(item.text, item.label);
    }
    this.lastTrainedTimestamp = new Date().toISOString();
  }

  public tokenize(text: string): string[] {
    if (!text) return [];

    // Extract raw tokens including currency signs, exclamation marks, and normal words
    const rawTokens: string[] = [];
    
    // Check for high-signal patterns
    if (/\b(?:https?:\/\/[^\s]+)\b/gi.test(text)) {
      rawTokens.push('__contains_url__');
    }
    if (/\b(?:\$|€|£)\s?\d+(?:,\d+)*(?:\.\d+)?\b/gi.test(text)) {
      rawTokens.push('__money_amount__');
    }
    if (/[!?]{2,}/.test(text)) {
      rawTokens.push('__excessive_punct__');
    }

    // Split text into alphanumeric words + keep significant markers
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s$€£_%-]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2);

    for (const w of words) {
      if (!STOP_WORDS.has(w)) {
        rawTokens.push(w);
      }
    }

    return rawTokens;
  }

  public train(text: string, label: 'spam' | 'ham'): void {
    const tokens = this.tokenize(text);
    if (label === 'spam') {
      this.totalSpamDocs++;
      for (const token of tokens) {
        this.vocabulary.add(token);
        this.totalSpamWords++;
        this.spamWordCounts.set(token, (this.spamWordCounts.get(token) || 0) + 1);
      }
    } else {
      this.totalHamDocs++;
      for (const token of tokens) {
        this.vocabulary.add(token);
        this.totalHamWords++;
        this.hamWordCounts.set(token, (this.hamWordCounts.get(token) || 0) + 1);
      }
    }
    this.lastTrainedTimestamp = new Date().toISOString();
  }

  public classify(text: string): NaiveBayesResult {
    const tokens = this.tokenize(text);
    const vocabSize = Math.max(this.vocabulary.size, 1);

    // Compute priors
    const totalDocs = Math.max(this.totalSpamDocs + this.totalHamDocs, 1);
    const priorSpam = (this.totalSpamDocs + 1) / (totalDocs + 2);
    const priorHam = (this.totalHamDocs + 1) / (totalDocs + 2);

    let logProbSpam = Math.log(priorSpam);
    let logProbHam = Math.log(priorHam);

    const tokenCounts: Map<string, number> = new Map();
    for (const t of tokens) {
      tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
    }

    const tokenContributions: TokenContribution[] = [];
    const allTokensInfo: { word: string; spamWeight: number }[] = [];

    // Effective denominator with Laplace smoothing
    const spamDenom = this.totalSpamWords + this.laplaceAlpha * vocabSize;
    const hamDenom = this.totalHamWords + this.laplaceAlpha * vocabSize;

    for (const [token, count] of tokenCounts.entries()) {
      const spamCount = this.spamWordCounts.get(token) || 0;
      const hamCount = this.hamWordCounts.get(token) || 0;

      // P(token | Spam) with Laplace smoothing
      const pTokenSpam = (spamCount + this.laplaceAlpha) / spamDenom;
      // P(token | Ham) with Laplace smoothing
      const pTokenHam = (hamCount + this.laplaceAlpha) / hamDenom;

      const tokenLogSpam = Math.log(pTokenSpam) * count;
      const tokenLogHam = Math.log(pTokenHam) * count;

      logProbSpam += tokenLogSpam;
      logProbHam += tokenLogHam;

      // Weight metric: log-odds ratio
      const weight = Math.log(pTokenSpam / pTokenHam);
      
      allTokensInfo.push({
        word: token,
        spamWeight: Number(weight.toFixed(3)),
      });

      // Only include significant tokens in contribution list
      if (spamCount > 0 || hamCount > 0 || Math.abs(weight) > 0.3) {
        tokenContributions.push({
          word: token,
          weight: Number(weight.toFixed(3)),
          spamFrequency: spamCount,
          hamFrequency: hamCount,
          countInText: count,
        });
      }
    }

    // Convert log-probabilities to normalized probabilities via log-sum-exp
    const maxLog = Math.max(logProbSpam, logProbHam);
    const expSpam = Math.exp(logProbSpam - maxLog);
    const expHam = Math.exp(logProbHam - maxLog);
    const spamProbability = expSpam / (expSpam + expHam);
    const hamProbability = expHam / (expSpam + expHam);

    // Sort contributions
    const topSpamTokens = tokenContributions
      .filter(tc => tc.weight > 0.05)
      .sort((a, b) => b.weight * b.countInText - a.weight * a.countInText)
      .slice(0, 10);

    const topHamTokens = tokenContributions
      .filter(tc => tc.weight < -0.05)
      .sort((a, b) => a.weight * a.countInText - b.weight * b.countInText)
      .slice(0, 10);

    return {
      spamProbability: Number(spamProbability.toFixed(4)),
      hamProbability: Number(hamProbability.toFixed(4)),
      rawLogOdds: Number((logProbSpam - logProbHam).toFixed(3)),
      priorSpam: Number(priorSpam.toFixed(3)),
      priorHam: Number(priorHam.toFixed(3)),
      topSpamTokens,
      topHamTokens,
      allTokens: allTokensInfo,
    };
  }

  public getMetrics(): ModelMetrics {
    const vocabSize = Math.max(this.vocabulary.size, 1);
    const spamDenom = this.totalSpamWords + this.laplaceAlpha * vocabSize;
    const hamDenom = this.totalHamWords + this.laplaceAlpha * vocabSize;

    // Evaluate against benchmark test set
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (const testItem of TEST_BENCHMARK_DATA) {
      const res = this.classify(testItem.text);
      const predictedSpam = res.spamProbability >= 0.5;
      const actualSpam = testItem.label === 'spam';

      if (predictedSpam && actualSpam) truePositives++;
      else if (predictedSpam && !actualSpam) falsePositives++;
      else if (!predictedSpam && !actualSpam) trueNegatives++;
      else if (!predictedSpam && actualSpam) falseNegatives++;
    }

    const totalTests = TEST_BENCHMARK_DATA.length;
    const accuracy = totalTests > 0 ? (truePositives + trueNegatives) / totalTests : 0.95;
    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 1.0;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 1.0;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 1.0;

    // Rank top spam words and top ham words in vocabulary
    const rankedTokens: { word: string; score: number }[] = [];
    for (const token of this.vocabulary) {
      const sCount = this.spamWordCounts.get(token) || 0;
      const hCount = this.hamWordCounts.get(token) || 0;
      const pSpam = (sCount + this.laplaceAlpha) / spamDenom;
      const pHam = (hCount + this.laplaceAlpha) / hamDenom;
      const logRatio = Math.log(pSpam / pHam);
      rankedTokens.push({ word: token, score: Number(logRatio.toFixed(3)) });
    }

    rankedTokens.sort((a, b) => b.score - a.score);
    const topSpamWords = rankedTokens.filter(t => t.score > 0).slice(0, 15);
    const topHamWords = [...rankedTokens].reverse().filter(t => t.score < 0).slice(0, 15);

    return {
      totalTrainedSamples: this.totalSpamDocs + this.totalHamDocs,
      spamSamplesCount: this.totalSpamDocs,
      hamSamplesCount: this.totalHamDocs,
      vocabularySize: this.vocabulary.size,
      accuracy: Number((accuracy * 100).toFixed(1)),
      precision: Number((precision * 100).toFixed(1)),
      recall: Number((recall * 100).toFixed(1)),
      f1Score: Number((f1Score * 100).toFixed(1)),
      lastRetrainedAt: this.lastTrainedTimestamp,
      topSpamWords,
      topHamWords,
    };
  }
}

export const naiveBayesSingleton = new NaiveBayesClassifier();
