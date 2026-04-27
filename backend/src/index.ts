import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import type { FormData } from './types/formData';
import { runAllValidations } from './validators/index';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/assess', async (req, res) => {
  const formData = req.body as Partial<FormData>;

  // Basic validation — must have at least openAccess section
  if (!formData.openAccess || !formData.about || !formData.editorial) {
    res.status(400).json({
      error: 'Missing required form sections: openAccess, about, editorial',
    });
    return;
  }

  const report = await runAllValidations(formData as FormData);
  res.json(report);
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
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
