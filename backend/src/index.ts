import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import type { FormData } from './types/formData';
import { runAllValidations } from './validators/index';
import { isAiConfigured } from './ai/aiClient';

// Overall budget for one assessment: 7 page scrapes (15s timeout each, run in
// 3 parallel groups) plus up to 6 AI calls. 150s leaves headroom without
// letting a stuck Puppeteer hang the request forever.
const ASSESSMENT_TIMEOUT_MS = 150_000;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const assessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many assessment requests. Please try again in a few minutes.' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/assess', assessLimiter, async (req, res) => {
  const formData = req.body as Partial<FormData>;

  // Basic validation — must have at least openAccess section
  if (!formData.openAccess || !formData.about || !formData.editorial) {
    res.status(400).json({
      error: 'Missing required form sections: openAccess, about, editorial',
    });
    return;
  }

  const language = typeof req.body.language === 'string' ? req.body.language : undefined;

  try {
    const report = await Promise.race([
      runAllValidations(formData as FormData, language),
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error('assessment timed out')), ASSESSMENT_TIMEOUT_MS)
      ),
    ]);
    res.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'assessment timed out') {
      res.status(504).json({
        error:
          'The assessment took too long to complete. Some of the provided pages may be very slow — please try again.',
      });
      return;
    }
    console.error(`Assessment failed: ${message}`);
    res.status(500).json({ error: 'Assessment failed due to an internal error. Please try again.' });
  }
});

// Serve frontend (only when dist directory exists, e.g. production)
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  if (!isAiConfigured()) {
    console.warn(
      'WARNING: GEMINI_API_KEY is not set. AI content checks will be skipped and reported as warnings.'
    );
  }
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
