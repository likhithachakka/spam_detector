export type ClassificationLabel = 'SPAM' | 'HAM' | 'SUSPICIOUS';

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface TokenContribution {
  word: string;
  weight: number; // positive = spam leaning, negative = ham leaning
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
  spamProbability: number; // 0 to 1
  hamProbability: number; // 0 to 1
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
  overallSpamScore: number; // 0 to 100
  confidence: number; // 0 to 100
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
  category: 'phishing' | 'financial-scam' | 'crypto' | 'urgent-spoof' | 'promotional' | 'work-email' | 'account-receipt' | 'personal';
  sender: string;
  subject: string;
  content: string;
  description: string;
}
