import { DetectedUrl, HeuristicRuleMatch, ThreatSeverity } from './types.ts';

export interface HeuristicRuleDefinition {
  id: string;
  name: string;
  category: 'urgency' | 'financial' | 'credential' | 'url' | 'obfuscation' | 'crypto' | 'phishing';
  severity: ThreatSeverity;
  score: number;
  description: string;
  test: (text: string, subject?: string, sender?: string) => { matched: boolean; snippets: string[] };
}

// Known link shorteners often abused in smishing and phishing
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy', 'v.gd', 'qr.ae'
];

// Suspicious / high-risk TLDs often registered by threat actors
const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.fun', '.live', '.cc', '.biz', '.info', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.rest', '.quest'
];

export const HEURISTIC_RULES: HeuristicRuleDefinition[] = [
  {
    id: 'rule-urgent-threat',
    name: 'Artificial Urgency & Threat Pressure',
    category: 'urgency',
    severity: 'high',
    score: 25,
    description: 'Threatens immediate account suspension, restriction, or penalty unless action is taken in hours.',
    test: (text) => {
      const regex = /\b(?:within (?:12|24|48) hours|immediate(?:ly)? (?:verify|update|action)|account (?:has been |will be )?(?:suspended|restricted|permanently locked|deleted)|final notice|action required immediately|arrest warrant)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-credential-harvesting',
    name: 'Credential & Identity Harvesting Lure',
    category: 'credential',
    severity: 'critical',
    score: 30,
    description: 'Directs the recipient to verify passwords, social security numbers, PINs, or banking logins.',
    test: (text) => {
      const regex = /\b(?:verify (?:your )?(?:identity|credentials|password|pin|account)|confirm (?:your )?billing|restore access|update your credit card|submit your social security)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-advance-fee-lottery',
    name: 'Advance-Fee / Inheritance / Lottery Fraud',
    category: 'financial',
    severity: 'critical',
    score: 30,
    description: 'Prompts with unexpected millions, unclaimed inheritance, barrister claims, or international lotteries.',
    test: (text) => {
      const regex = /\b(?:unclaimed (?:estate|funds|balance)|next of kin|barrister|international lottery|won \$[0-9,]+|grand prize winner|confidential partnership proposal)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-crypto-giveaway',
    name: 'Cryptocurrency Doubling & Airdrop Scam',
    category: 'crypto',
    severity: 'high',
    score: 25,
    description: 'Solicits cryptocurrency deposits under the guise of fake doubling giveaways or airdrops.',
    test: (text) => {
      const regex = /\b(?:send \d+(?:\.\d+)? (?:btc|eth|sol)|receive \d+(?:\.\d+)? (?:btc|eth|sol) back|airdrop claim|connect your metamask|elon musk binance|crypto giveaway)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-ceo-giftcard-bec',
    name: 'Business Email Compromise (BEC) & Gift Card Demand',
    category: 'phishing',
    severity: 'critical',
    score: 30,
    description: 'Pretends to be an executive requesting untraceable gift cards or emergency scratch-off PIN codes.',
    test: (text) => {
      const regex = /\b(?:purchase \d+ (?:apple|target|amazon|steam) gift cards|scratch the back|scratch-off pin|treat this with (?:top )?confidentiality|are you at your desk|in a meeting so do not call)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-suspicious-urls',
    name: 'Deceptive / High-Risk URL Patterns',
    category: 'url',
    severity: 'high',
    score: 25,
    description: 'Embeds link shorteners, high-risk TLDs (.xyz, .top, .live), or brand impersonation URLs.',
    test: (text) => {
      const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
      const matches = text.match(urlRegex) || [];
      const suspiciousHits: string[] = [];

      for (const url of matches) {
        const lower = url.toLowerCase();
        if (URL_SHORTENERS.some(shortener => lower.includes(shortener))) {
          suspiciousHits.push(`Shortener: ${url}`);
        } else if (SUSPICIOUS_TLDS.some(tld => lower.includes(tld))) {
          suspiciousHits.push(`High-Risk TLD: ${url}`);
        } else if (/\b(?:paypal|apple|chase|google|microsoft|netflix|amazon)[^/\s]*\.[a-z]{2,}/i.test(url) && 
                   !lower.includes('paypal.com') && !lower.includes('apple.com') && 
                   !lower.includes('google.com') && !lower.includes('netflix.com') && 
                   !lower.includes('amazon.com') && !lower.includes('chase.com')) {
          suspiciousHits.push(`Brand spoofing domain: ${url}`);
        }
      }
      return { matched: suspiciousHits.length > 0, snippets: suspiciousHits.slice(0, 3) };
    }
  },
  {
    id: 'rule-tech-support-scareware',
    name: 'Tech Support Impersonation & Scareware',
    category: 'phishing',
    severity: 'high',
    score: 25,
    description: 'Claims computer virus infection, locked Windows Defender, and directs to toll-free phone helplines.',
    test: (text) => {
      const regex = /\b(?:infected with trojan|windows defender (?:was )?locked|call microsoft certified|do not shut down your computer|hard drive will be wiped|geek squad (?:annual )?subscription renewal)\b/gi;
      const matches = Array.from(text.matchAll(regex)).map(m => m[0]);
      return { matched: matches.length > 0, snippets: Array.from(new Set(matches)).slice(0, 3) };
    }
  },
  {
    id: 'rule-excessive-caps-formatting',
    name: 'High Emotional Agitation & Caps Abuse',
    category: 'obfuscation',
    severity: 'low',
    score: 10,
    description: 'Employs screaming all-caps phrases and multi-exclamation clusters to provoke panic or euphoria.',
    test: (text) => {
      const capsMatches = text.match(/\b[A-Z]{5,}\b/g) || [];
      const exclamationMatches = text.match(/!{2,}|\${2,}/g) || [];
      const hasExcessiveCaps = capsMatches.length >= 4;
      const hasExcessiveExclamations = exclamationMatches.length >= 2;
      
      const snippets: string[] = [];
      if (hasExcessiveCaps) snippets.push(`Multiple ALL-CAPS words: ${capsMatches.slice(0, 3).join(', ')}`);
      if (hasExcessiveExclamations) snippets.push(`Clustered punctuation: ${exclamationMatches.slice(0, 2).join(', ')}`);

      return { matched: snippets.length > 0, snippets };
    }
  },
  {
    id: 'rule-sender-spoof-mismatch',
    name: 'Brand Sender Domain Discrepancy',
    category: 'phishing',
    severity: 'high',
    score: 20,
    description: 'Sender claims to be a trusted institution (PayPal, Netflix, Apple, Bank) but originates from a mismatched domain.',
    test: (text, subject, sender) => {
      if (!sender) return { matched: false, snippets: [] };
      const lowerSender = sender.toLowerCase();
      const combinedText = `${subject || ''} ${text}`.toLowerCase();
      
      const brands = [
        { name: 'paypal', legitDomain: 'paypal.com' },
        { name: 'netflix', legitDomain: 'netflix.com' },
        { name: 'apple', legitDomain: 'apple.com' },
        { name: 'chase', legitDomain: 'chase.com' },
        { name: 'amazon', legitDomain: 'amazon.com' },
        { name: 'microsoft', legitDomain: 'microsoft.com' },
      ];

      for (const brand of brands) {
        if (combinedText.includes(brand.name) && !lowerSender.endsWith(`@${brand.legitDomain}`)) {
          // If sender claims to be PayPal or references PayPal security but sender is yahoo.com or fake domain
          if (lowerSender.includes(brand.name) || combinedText.includes(`${brand.name} account`)) {
            return {
              matched: true,
              snippets: [`Sender "${sender}" claims ${brand.name} affiliation without originating from @${brand.legitDomain}`]
            };
          }
        }
      }
      return { matched: false, snippets: [] };
    }
  }
];

export function extractAndInspectUrls(text: string): DetectedUrl[] {
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const urls = text.match(urlRegex) || [];
  const results: DetectedUrl[] = [];

  for (const rawUrl of Array.from(new Set(urls))) {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase();
      const threatReasons: string[] = [];
      let isSuspicious = false;

      // Check shorteners
      if (URL_SHORTENERS.some(s => host.includes(s))) {
        isSuspicious = true;
        threatReasons.push('Obfuscated through public URL shortener');
      }

      // Check suspicious TLDs
      if (SUSPICIOUS_TLDS.some(tld => host.endsWith(tld))) {
        isSuspicious = true;
        threatReasons.push(`Uses high-risk registrar TLD (${host.split('.').pop()})`);
      }

      // Check raw IP address
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
        isSuspicious = true;
        threatReasons.push('Points directly to raw IP address instead of registered domain');
      }

      // Check brand spoofing in subdomains
      const targetBrands = ['paypal', 'netflix', 'apple', 'amazon', 'bankofamerica', 'chase', 'wells-fargo'];
      for (const brand of targetBrands) {
        if (host.includes(brand) && !host.endsWith(`${brand}.com`)) {
          isSuspicious = true;
          threatReasons.push(`Impersonates brand "${brand}" in untrusted domain`);
        }
      }

      results.push({
        url: rawUrl,
        domain: host,
        isSuspicious,
        threatReasons,
      });
    } catch {
      // Invalid URL syntax
    }
  }

  return results;
}

export function evaluateHeuristics(
  text: string,
  subject?: string,
  sender?: string,
  enabledRuleIds?: string[]
): {
  totalScore: number;
  rulesTriggered: HeuristicRuleMatch[];
  detectedUrls: DetectedUrl[];
  headerFlags: string[];
} {
  const combined = `${subject ? subject + '\n' : ''}${text}`;
  const triggered: HeuristicRuleMatch[] = [];
  const urls = extractAndInspectUrls(combined);
  const headerFlags: string[] = [];

  const activeRules = enabledRuleIds && enabledRuleIds.length > 0
    ? HEURISTIC_RULES.filter(r => enabledRuleIds.includes(r.id))
    : HEURISTIC_RULES;

  let totalScore = 0;

  for (const rule of activeRules) {
    const outcome = rule.test(combined, subject, sender);
    if (outcome.matched) {
      triggered.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        description: rule.description,
        matchedSnippets: outcome.snippets,
        scoreContribution: rule.score,
      });
      totalScore += rule.score;
    }
  }

  if (sender) {
    if (sender.includes('.xyz') || sender.includes('.top') || sender.includes('.live')) {
      headerFlags.push(`Sender domain has suspicious TLD: ${sender}`);
    }
  }

  return {
    totalScore: Math.min(totalScore, 100),
    rulesTriggered: triggered,
    detectedUrls: urls,
    headerFlags,
  };
}
