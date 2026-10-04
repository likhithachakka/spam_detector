import { GoogleGenAI } from '@google/genai';
import { AiForensicResult, HeuristicRuleMatch, ThreatSeverity } from './types.ts';

export async function runAiForensics(
  content: string,
  subject?: string,
  sender?: string,
  heuristicRulesTriggered: HeuristicRuleMatch[] = [],
  naiveBayesScore: number = 0
): Promise<AiForensicResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini API key is configured, return high-fidelity fallback analysis
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateFallbackForensics(content, heuristicRulesTriggered, naiveBayesScore);
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are a Senior Cyber Threat Intelligence & Email Security Analyst.
Perform an in-depth forensic spam, phishing, and threat assessment on the following incoming message:

Sender: ${sender || 'Unknown / Not provided'}
Subject: ${subject || 'None'}
Body Content:
"""
${content.slice(0, 3000)}
"""

Context from local heuristic scan:
- Local Naive Bayes Spam Score: ${Math.round(naiveBayesScore * 100)}%
- Triggered Rule Signatures: ${heuristicRulesTriggered.map(r => r.name).join(', ') || 'None'}

Analyze the message and output a strictly valid JSON object matching this structure:
{
  "category": "Credential Phishing | Spear Phishing (BEC) | Advance-Fee Scam (419) | Crypto Scam | Smishing | Unsolicited Commercial Spam | Tech Support Scareware | Legitimate / Clean",
  "threatLevel": "critical | high | medium | low | none",
  "confidenceScore": number between 0 and 100,
  "summary": "Concise 2-sentence forensic evaluation summarizing the intent and threat mechanics",
  "tacticsDetected": ["list of 2-4 attack tactics, e.g. Domain spoofing, Artificial urgency, Coercive tone, Obfuscated URL"],
  "iocs": ["list of specific suspicious IOCs, domains, numbers, or phrases discovered in the text"],
  "psychologicalTriggers": ["list of cognitive levers targeted, e.g. Fear of loss, Greed, Authority bias, Social urgency"],
  "recommendedAction": "Direct actionable advice for the recipient (e.g. Block sender domain, do not click link, delete immediately, safe to interact)"
}
Return ONLY JSON. Do not wrap in markdown quotes if possible or return pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText.trim());

    return {
      category: parsed.category || 'Threat Assessment',
      threatLevel: normalizeThreatLevel(parsed.threatLevel),
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 85)),
      summary: parsed.summary || 'Automated threat evaluation completed.',
      tacticsDetected: Array.isArray(parsed.tacticsDetected) ? parsed.tacticsDetected : [],
      iocs: Array.isArray(parsed.iocs) ? parsed.iocs : [],
      psychologicalTriggers: Array.isArray(parsed.psychologicalTriggers) ? parsed.psychologicalTriggers : [],
      recommendedAction: parsed.recommendedAction || 'Exercise caution and verify sender identity.',
      isGeneratedByAi: true,
      analysisSource: 'gemini',
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to local heuristic analysis:', error);
    return generateFallbackForensics(content, heuristicRulesTriggered, naiveBayesScore);
  }
}

function normalizeThreatLevel(raw: string): ThreatSeverity {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('crit')) return 'critical';
  if (lower.includes('high')) return 'high';
  if (lower.includes('med')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'none';
}

function generateFallbackForensics(
  content: string,
  rulesTriggered: HeuristicRuleMatch[],
  naiveBayesScore: number
): AiForensicResult {
  const isHighRisk = naiveBayesScore >= 0.7 || rulesTriggered.some(r => r.severity === 'critical');
  const isMediumRisk = naiveBayesScore >= 0.4 || rulesTriggered.length > 0;

  if (isHighRisk) {
    const primaryRule = rulesTriggered[0];
    const categoryName = primaryRule ? primaryRule.name : 'High-Confidence Spam';

    return {
      category: categoryName,
      threatLevel: 'high',
      confidenceScore: Math.round(Math.max(naiveBayesScore * 100, 80)),
      summary: 'Heuristic and probabilistic models identified aggressive deception indicators and high-risk token distribution.',
      tacticsDetected: rulesTriggered.map(r => r.name).slice(0, 3).concat(['Statistical spam anomaly']),
      iocs: rulesTriggered.flatMap(r => r.matchedSnippets).slice(0, 4),
      psychologicalTriggers: ['Urgency pressure', 'Impersonation of authority', 'Compulsion to act'],
      recommendedAction: 'Do not click links or respond. Report sender as phishing and quarantine the message.',
      isGeneratedByAi: false,
      analysisSource: 'rule-engine-fallback',
    };
  }

  if (isMediumRisk) {
    return {
      category: 'Unsolicited / Suspicious Message',
      threatLevel: 'medium',
      confidenceScore: 68,
      summary: 'Message contains commercial marketing or unusual phraseology that warrants caution.',
      tacticsDetected: ['Unsolicited mass solicitation', 'Promotional hyperbole'],
      iocs: rulesTriggered.flatMap(r => r.matchedSnippets).slice(0, 3),
      psychologicalTriggers: ['Fear of missing out (FOMO)', 'Commercial curiosity'],
      recommendedAction: 'Verify the identity of the sender through official out-of-band channels.',
      isGeneratedByAi: false,
      analysisSource: 'rule-engine-fallback',
    };
  }

  return {
    category: 'Legitimate Correspondence',
    threatLevel: 'none',
    confidenceScore: 92,
    summary: 'Message content conforms to normal benign communication patterns with zero threat indicators.',
    tacticsDetected: ['Standard legitimate correspondence format'],
    iocs: [],
    psychologicalTriggers: ['Standard conversational'],
    recommendedAction: 'Safe to open and reply. Normal business or personal message.',
    isGeneratedByAi: false,
    analysisSource: 'rule-engine-fallback',
  };
}
