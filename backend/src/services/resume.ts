import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import resumeRouter from '../routes/resume';
import { initDb } from '../data/db';
import { questions, topics, cheatSheets, users, patternDetails } from '../data/seed';
import { TEST_CASES } from '../data/testCases';

const testCaseData = Object.entries(TEST_CASES).flatMap(([slug, cases]) =>
  cases.map(tc => ({ ...tc, slug }))
);

const app = express();
const PORT = Number(process.env.PORT) || 3006;

app.use(cors({
  origin: (_origin: any, callback: any) => callback(null, _origin || true),
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req, res) => res.json({ service: 'resume', status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/resume', resumeRouter);

(async () => {
  await initDb(questions, topics, cheatSheets, users, testCaseData, patternDetails);
  app.listen(PORT, () => {
    console.log(`[resume-service] running on http://localhost:${PORT}`);
    console.log(`[resume-config] OLLAMA_URL=${process.env.OLLAMA_URL || 'http://localhost:11434'}, MODEL=${process.env.OLLAMA_MODEL || 'llama3.1'}`);
    console.log(`[resume-config] GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET'}`);
  });
})();
