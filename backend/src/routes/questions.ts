import { Router, Response } from 'express';
import { cheatSheets } from '../data/seed';
import { authenticate, AuthRequest, isPremium } from '../middleware/auth';
import { isPremiumFresh, recordRecentView } from '../data/store';
import { getFunctionSignature } from '../data/functionSignatures';
import { generateStarterCode } from '../data/templateGenerator';
import { getQuestions, getQuestion } from '../data/db';

const router = Router();

async function checkPremium(req: AuthRequest): Promise<boolean> {
  // Try authenticated check first
  if (req.user) return isPremiumFresh(req.user.id);

  // Try to decode token manually for unauthenticated routes
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'dsa-cheatsheets-secret-key-2024';
      const decoded = jwt.verify(header.split(' ')[1], secret) as { id: string; role: string };
      if (decoded.role === 'admin') return true;
      return isPremiumFresh(decoded.id);
    } catch {
      return false;
    }
  }
  return false;
}

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    let result = [...getQuestions()];

    if (req.query.difficulty) {
      const diff = (req.query.difficulty as string).toLowerCase();
      result = result.filter((q) => (q.difficulty || '').toLowerCase() === diff);
    }

    if (req.query.topic) {
      const topic = (req.query.topic as string).toLowerCase();
      result = result.filter((q) => (q.topic_name || '').toLowerCase() === topic || q.topic_id === topic);
    }

    res.json(result);
  } catch (e: any) {
    console.error('[questions] GET / error:', e?.message || e);
    console.error(e?.stack);
    res.status(500).json({ error: 'Failed to fetch questions', message: e?.message || 'Unknown error' });
  }
});

router.get('/search', (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase();
  if (!q) return res.json([]);

  const result = getQuestions()
    .filter((qs) => {
      return (qs.title || '').toLowerCase().includes(q) ||
        (qs.pattern || '').toLowerCase().includes(q) ||
        (qs.topic_name || '').toLowerCase().includes(q);
    })
    .slice(0, 8);

  res.json(result);
});

router.get('/:slug', async (req: AuthRequest, res: Response) => {
  const question = getQuestion(req.params.slug);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  if (req.user?.id) {
    recordRecentView(req.user.id, question.id);
  }

  const premium = await checkPremium(req);

  if (!premium && question.difficulty !== 'Easy') {
    return res.status(403).json({
      error: 'Premium subscription required',
      requiresPremium: true,
      question: {
        title: question.title,
        difficulty: question.difficulty,
        topic_name: question.topic_name,
      },
    });
  }

  const cs = cheatSheets.find((c) => c.question_id === question.slug);

  const starterTemplate = (): Record<string, string> => {
    if (question.starter_code) return question.starter_code;
    const sig = getFunctionSignature(question.slug);
    if (sig) return generateStarterCode(sig);

    const fnName = question.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return {
      javascript: `function ${fnName}(/* params */) {\n  \n}`,
      python: `def ${fnName}(/* params */):\n    pass`,
      java: `class Solution {\n    public void ${fnName}() {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    void ${fnName}() {\n        \n    }\n};`,
      c: `int ${fnName}() {\n    \n}`,
    };
  };

  const similarQuestions = getQuestions()
    .filter((q) => q.id !== question.id && (q.topic_name === question.topic_name || q.pattern === question.pattern))
    .slice(0, 5)
    .map(({ id, title, slug, difficulty }) => ({ id, title, slug, difficulty }));

  res.json({
    ...question,
    cheat_sheet: {
      ...(cs || {
        pattern: question.pattern, recognition: [], approach: 'Optimal approach details coming soon.',
        approach_steps: ['Analyze the problem to identify the pattern', 'Choose the appropriate data structure', 'Implement the optimal algorithm', 'Test with edge cases'],
        approach_diagram: 'Problem -> Pattern Recognition -> Data Structure -> Algorithm -> Solution',
        approach_images: [],
        complexity: { time: 'N/A', space: 'N/A' },
        mistakes: [],
      }),
      template: starterTemplate(),
    },
    similar_questions: similarQuestions,
  });
});

export default router;
