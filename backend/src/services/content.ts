import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import topicsRouter from '../routes/topics';
import questionsRouter from '../routes/questions';
import publicPatternsRouter from '../routes/publicPatterns';
import publicStatsRouter from '../routes/publicStats';
import adminRouter from '../routes/admin';
import { initDb } from '../data/db';
import { questions, topics, cheatSheets, users, patternDetails } from '../data/seed';
import { TEST_CASES } from '../data/testCases';

const testCaseData = Object.entries(TEST_CASES).flatMap(([slug, cases]) =>
  cases.map(tc => ({ ...tc, slug }))
);

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(cors({
  origin: (_origin, callback) => callback(null, _origin || true),
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req, res) => res.json({ service: 'content', status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/topics', topicsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/patterns', publicPatternsRouter);
app.use('/api/stats', publicStatsRouter);
app.use('/api/admin', adminRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[content] Unhandled error:', err?.message || err);
  console.error(err?.stack);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', message: err?.message || 'Unknown error' });
  }
});

(async () => {
  await initDb(questions, topics, cheatSheets, users, testCaseData, patternDetails);
  app.listen(PORT, () => {
    console.log(`[content-service] running on http://localhost:${PORT}`);
  });
})();
