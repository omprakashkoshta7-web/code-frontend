import { Router, Request, Response } from 'express';
import { executeCode, runTestCases, executeVisualize, analyzeComplexity, aiAnalyzeComplexity, isCodeEmpty, TestCase } from '../services/executor';
import { generateDriver, extractFunctionName } from '../drivers/driverGenerator';
import { runCode } from '../runners/index';
import { getTestCases, getQuestion } from '../data/db';
import { recordSubmission, getSubmissions, isPremiumFresh } from '../data/store';
import { questions } from '../data/seed';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function getDefaultTestCases(slug: string): TestCase[] {
  return [];
}

async function getTestCasesForUser(slug: string, userId: string, isAdmin: boolean): Promise<{ visible: any[]; premiumRequired: boolean }> {
  const testCases = getTestCases(slug);
  const question = getQuestion(slug) || questions.find((q) => q.slug === slug);
  const premiumRequired = !!question && question.difficulty !== 'Easy';
  if (premiumRequired) {
    const premium = isAdmin || await isPremiumFresh(userId);
    if (!premium) {
      return { visible: testCases.filter((tc: any) => !tc.is_hidden), premiumRequired: true };
    }
  }
  return { visible: testCases, premiumRequired: false };
}

router.get('/testcases/:slug', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const { visible, premiumRequired } = await getTestCasesForUser(req.params.slug, userId, isAdmin);
  res.json({ test_cases: visible, premium_required: premiumRequired });
});

router.post('/run', authenticate, async (req: AuthRequest, res: Response) => {
  const { code, language, slug } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language required' });
  }

  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const { visible: allTestCases, premiumRequired } = await getTestCasesForUser(slug || '', userId, isAdmin);
  if (allTestCases.length === 0) {
    return res.status(400).json({ error: 'No test cases found for this question' });
  }
  if (premiumRequired) {
    return res.status(403).json({ error: 'Premium subscription required', requiresPremium: true });
  }
  const results = allTestCases.map((tc) => {
    let codeToRun = code;
    if (language !== 'javascript') {
      const fnName = extractFunctionName(code, language);
      codeToRun = generateDriver(code, language, [{ input: tc.input, expected: tc.expected_output }], fnName);
    }
    const r = executeCode(codeToRun, language, tc.input);
    return {
      id: tc.id,
      input: tc.input,
      expected: tc.expected_output,
      output: r.output,
      error: r.error,
      runtime: r.runtime,
      status: r.status,
    };
  });

  function normalizeOutput(s: string): string {
    try { return JSON.stringify(JSON.parse(s.toLowerCase())); } catch { return s.trim().toLowerCase(); }
  }
  const firstPassed = results[0]?.status === 'success' && normalizeOutput(results[0]?.output || '') === normalizeOutput(allTestCases[0]?.expected_output || '');

  res.json({
    results,
    first_passed: firstPassed,
  });
});

router.post('/run-custom', (req: AuthRequest, res: Response) => {
  const { code, language, input } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language required' });
  }

  const result = executeCode(code, language, input || '');

  res.json({
    output: result.output,
    error: result.error,
    runtime: result.runtime,
    status: result.status,
  });
});

router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  const { code, language, slug } = req.body;
  const userId = req.user!.id;
  const userName = req.user!.name || 'User';
  if (!code || !language || !slug) {
    return res.status(400).json({ error: 'Code, language, and slug required' });
  }

  const isAdmin = req.user!.role === 'admin';
  const { visible: testCases, premiumRequired } = await getTestCasesForUser(slug, userId, isAdmin);
  if (testCases.length === 0) {
    return res.status(400).json({ error: 'No test cases found for this question' });
  }
  if (premiumRequired) {
    return res.status(403).json({ error: 'Premium subscription required', requiresPremium: true });
  }

  const result = runTestCases(code, language, testCases, slug);

  const question = getQuestion(slug) || questions.find((q) => q.slug === slug);
  const totalRuntime = (result.test_results || []).reduce((sum: number, t: any) => sum + (t.runtime || 0), 0);

  recordSubmission({
    id: uuidv4(),
    user_id: userId,
    user_name: userName,
    question_id: question?.id || '',
    question_slug: slug,
    question_title: question?.title || slug,
    language,
    passed: result.passed === result.total && result.total > 0,
    total: result.total,
    runtime_ms: totalRuntime,
    submitted_at: new Date().toISOString(),
  });

  res.json({
    passed: result.passed,
    total: result.total,
    status: result.status,
    test_results: result.test_results,
  });
});

router.post('/visualize', (req: Request, res: Response) => {
  const { code, language, input } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language required' });
  }

  const result = executeVisualize(code, language, input || '');
  res.json(result);
});

router.post('/analyze', async (req: Request, res: Response) => {
  const { code, language } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code required' });
  }

  if (isCodeEmpty(code)) {
    return res.json({ detected: 'N/A', reasoning: 'Write your solution code first, then analyze.', badge: 'acceptable' });
  }

  const complexity = await aiAnalyzeComplexity(code, language || 'javascript');
  res.json(complexity);
});

export default router;
