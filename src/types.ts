export type ClassificationLabel = 'SPAM' | 'HAM' | 'SUSPICIOUS';
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface TokenContribution {
  word: string;
  weight: number;
  spamFrequency: number;
  hamFrequency: number;
  countInText: number;
}

export interface HeuristicRuleMatch {
  id: string;
  name: string;
  category: 'urgency' | 'financial' | 'credential' | 'url' | 'obfuscation' | 'crypto' | 'phishing';
  severity: ThreatSeverity;
  description: string;
  matchedSnippets: string[];
  scoreContribution: number;
}

export interface DetectedUrl {
  url: string;
  domain: string;
  isSuspicious: boolean;
  threatReasons: string[];
}

export interface NaiveBayesResult {
  spamProbability: number;
  hamProbability: number;
  rawLogOdds: number;
  priorSpam: number;
  priorHam: number;
  topSpamTokens: TokenContribution[];
  topHamTokens: TokenContribution[];
  allTokens: { word: string; spamWeight: number }[];
}

export interface AiForensicResult {
  category: string;
  threatLevel: ThreatSeverity;
  confidenceScore: number;
  summary: string;
  tacticsDetected: string[];
  iocs: string[];
  psychologicalTriggers: string[];
  recommendedAction: string;
  isGeneratedByAi: boolean;
  analysisSource: 'gemini' | 'rule-engine-fallback';
}

export interface ClassificationReport {
  id: string;
  timestamp: string;
  inputContent: string;
  subject?: string;
  sender?: string;
  finalLabel: ClassificationLabel;
  overallSpamScore: number;
  confidence: number;
  riskLevel: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Threat' | 'Dangerous Spam';
  naiveBayes: NaiveBayesResult;
  heuristics: {
    totalScore: number;
    rulesTriggered: HeuristicRuleMatch[];
    detectedUrls: DetectedUrl[];
    headerFlags: string[];
  };
  aiForensics?: AiForensicResult;
  processingTimeMs: number;
}

export interface ModelMetrics {
  totalTrainedSamples: number;
  spamSamplesCount: number;
  hamSamplesCount: number;
  vocabularySize: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastRetrainedAt: string;
  topSpamWords: { word: string; score: number }[];
  topHamWords: { word: string; score: number }[];
}

export interface SampleEmail {
  id: string;
  title: string;
  type: 'spam' | 'ham';
  category: string;
  sender: string;
  subject: string;
  content: string;
  description: string;
}

export interface HeuristicRuleConfig {
  id: string;
  name: string;
  category: string;
  severity: ThreatSeverity;
  score: number;
  description: string;
}
