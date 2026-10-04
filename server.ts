import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { naiveBayesSingleton } from './src/server/naiveBayes.ts';
import { evaluateHeuristics, HEURISTIC_RULES, extractAndInspectUrls } from './src/server/heuristics.ts';
import { runAiForensics } from './src/server/geminiAdvisor.ts';
import { SAMPLE_PRESETS } from './src/server/dataset.ts';
import { ClassificationReport, ClassificationLabel } from './src/server/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // 1. Single classification
  app.post('/api/classify', async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const {
        content = '',
        subject = '',
        sender = '',
        useAi = true,
        threshold = 50,
        enabledRules,
      } = req.body;

      if (!content && !subject) {
        return res.status(400).json({ error: 'Please provide email/message content or subject.' });
      }

      // Combine text for Naive Bayes
      const fullText = `${subject ? subject + ' ' : ''}${content}`;

      // Run statistical Naive Bayes
      const nbResult = naiveBayesSingleton.classify(fullText);

      // Run Heuristic rule engine
      const heuristicResult = evaluateHeuristics(content, subject, sender, enabledRules);

      // Weighted Ensemble calculation
      // NB is normalized 0-100, Heuristic is 0-100
      const nbScorePercent = nbResult.spamProbability * 100;
      let ensembleScore = Math.round(nbScorePercent * 0.55 + heuristicResult.totalScore * 0.45);

      // Critical overrides: if critical credential harvesting or BEC rule hit, floor score to at least 78
      if (heuristicResult.rulesTriggered.some(r => r.severity === 'critical')) {
        ensembleScore = Math.max(ensembleScore, 78);
      }

      ensembleScore = Math.min(100, Math.max(0, ensembleScore));

      // Final classification label based on user threshold
      let finalLabel: ClassificationLabel = 'HAM';
      if (ensembleScore >= threshold) {
        finalLabel = 'SPAM';
      } else if (ensembleScore >= Math.max(threshold - 20, 30)) {
        finalLabel = 'SUSPICIOUS';
      }

      // Risk level assessment
      let riskLevel: ClassificationReport['riskLevel'] = 'Safe';
      if (ensembleScore >= 80) riskLevel = 'Dangerous Spam';
      else if (ensembleScore >= 60) riskLevel = 'High Threat';
      else if (ensembleScore >= 40) riskLevel = 'Suspicious';
      else if (ensembleScore >= 20) riskLevel = 'Low Risk';

      // Confidence score (distance from ambiguous 50% zone)
      const confidence = Math.min(100, Math.round(50 + Math.abs(ensembleScore - 50) * 0.95));

      // AI deep forensics
      let aiForensics;
      if (useAi) {
        aiForensics = await runAiForensics(
          content,
          subject,
          sender,
          heuristicResult.rulesTriggered,
          nbResult.spamProbability
        );
      }

      const report: ClassificationReport = {
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        inputContent: content,
        subject,
        sender,
        finalLabel,
        overallSpamScore: ensembleScore,
        confidence,
        riskLevel,
        naiveBayes: nbResult,
        heuristics: heuristicResult,
        aiForensics,
        processingTimeMs: Date.now() - startTime,
      };

      res.json(report);
    } catch (error: any) {
      console.error('Error during classification:', error);
      res.status(500).json({ error: error.message || 'Internal classification error' });
    }
  });

  // 2. Batch classification
  app.post('/api/batch-classify', async (req: Request, res: Response) => {
    try {
      const { items = [], threshold = 50 } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of items to classify.' });
      }

      const clampedItems = items.slice(0, 100);
      let spamCount = 0;
      let hamCount = 0;
      let suspiciousCount = 0;
      let totalScoreSum = 0;

      const results = clampedItems.map((item, idx) => {
        const text = item.text || item.content || '';
        const subject = item.subject || '';
        const sender = item.sender || '';
        const fullText = `${subject ? subject + ' ' : ''}${text}`;

        const nb = naiveBayesSingleton.classify(fullText);
        const heur = evaluateHeuristics(text, subject, sender);

        let score = Math.round(nb.spamProbability * 100 * 0.55 + heur.totalScore * 0.45);
        if (heur.rulesTriggered.some(r => r.severity === 'critical')) {
          score = Math.max(score, 78);
        }
        score = Math.min(100, Math.max(0, score));

        let label: ClassificationLabel = 'HAM';
        if (score >= threshold) {
          label = 'SPAM';
          spamCount++;
        } else if (score >= Math.max(threshold - 20, 30)) {
          label = 'SUSPICIOUS';
          suspiciousCount++;
        } else {
          hamCount++;
        }

        totalScoreSum += score;

        return {
          id: item.id || `item-${idx + 1}`,
          title: item.title || subject || text.slice(0, 35) + '...',
          preview: text.slice(0, 120),
          score,
          label,
          triggeredRulesCount: heur.rulesTriggered.length,
          topSpamWord: nb.topSpamTokens[0]?.word || null,
        };
      });

      res.json({
        summary: {
          total: results.length,
          spamCount,
          hamCount,
          suspiciousCount,
          averageSpamScore: Math.round(totalScoreSum / (results.length || 1)),
          spamRatioPercent: Math.round((spamCount / (results.length || 1)) * 100),
        },
        results,
      });
    } catch (error: any) {
      console.error('Error in batch classification:', error);
      res.status(500).json({ error: error.message || 'Batch classification failed' });
    }
  });

  // 3. Model statistics & metrics
  app.get('/api/model-stats', (_req: Request, res: Response) => {
    try {
      const metrics = naiveBayesSingleton.getMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Online learning / training
  app.post('/api/train', (req: Request, res: Response) => {
    try {
      const { text, label, items } = req.body;

      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.text && (item.label === 'spam' || item.label === 'ham')) {
            naiveBayesSingleton.train(item.text, item.label);
          }
        }
      } else if (text && (label === 'spam' || label === 'ham')) {
        naiveBayesSingleton.train(text, label);
      } else {
        return res.status(400).json({ error: 'Valid text and label ("spam" | "ham") required.' });
      }

      const updatedMetrics = naiveBayesSingleton.getMetrics();
      res.json({
        success: true,
        message: 'Model weights successfully updated with new training sample(s).',
        metrics: updatedMetrics,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Reset model to original baseline
  app.post('/api/reset-model', (_req: Request, res: Response) => {
    try {
      naiveBayesSingleton.initialize();
      const metrics = naiveBayesSingleton.getMetrics();
      res.json({ success: true, message: 'Model reset to initial training baseline.', metrics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Get heuristic rules
  app.get('/api/rules', (_req: Request, res: Response) => {
    const rules = HEURISTIC_RULES.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      severity: r.severity,
      score: r.score,
      description: r.description,
    }));
    res.json(rules);
  });

  // 7. Get presets / sample emails
  app.get('/api/samples', (_req: Request, res: Response) => {
    res.json(SAMPLE_PRESETS);
  });

  // 8. Inspect standalone URL or header
  app.post('/api/inspect-url', (req: Request, res: Response) => {
    try {
      const { url = '' } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
      }
      const results = extractAndInspectUrls(url);
      res.json(results[0] || {
        url,
        domain: '',
        isSuspicious: false,
        threatReasons: ['Unable to parse valid URL structure'],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SentinelSpam server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
