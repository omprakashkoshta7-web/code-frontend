import { Router, Request, Response } from 'express';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import type { Question, CheatSheet, ShopProduct } from '../types';
import { getDb, saveDb, addQuestion, updateQuestion, deleteQuestion, getTestCases, addTestCase, updateTestCase, deleteTestCase, addTopic, updateTopic, deleteTopic } from '../data/db';
import { getFunctionSignature } from '../data/functionSignatures';
import { generateStarterCode } from '../data/templateGenerator';

const router = Router();

// router.use(authenticate);
// router.use(adminOnly);

// Stats
router.get('/stats', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json({
    total_users: db.users.length,
    total_questions: db.questions.length,
    total_topics: db.topics.length,
    total_test_cases: db.testCases.length,
  });
});

// ========== QUESTIONS ==========
router.get('/questions', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.questions.map((q) => ({
    id: q.id, title: q.title, slug: q.slug, difficulty: q.difficulty, topic_name: q.topic_name,
    visualization_type: q.visualization_type, sample_input: q.sample_input,
  })));
});

router.get('/questions/:slug', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const question = db.questions.find(q => q.slug === req.params.slug);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json(question);
});

router.post('/questions', (req: Request, res: Response) => {
  const {
    title, difficulty, topic_id, description, pattern,
    problem_statement, input_format, output_format, constraints, explanation,
    visualization_type, algorithm_type, sample_input, enable_visualization,
    starter_code: customStarterCode, companies, company_frequency,
    sample_tests, hidden_tests, examples,
  } = req.body;
  if (!title || !difficulty || !topic_id) {
    return res.status(400).json({ error: 'Title, difficulty, and topic required' });
  }

  const db = getDb();
  const topic = db.topics.find((t: any) => t.slug === topic_id || t.id === topic_id);
  const slug = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  // Auto-detect visualization_type from topic/pattern if not provided
  const autoDetectVizType = (): string => {
    const topicName = (topic?.name || topic_id || '').toLowerCase();
    const patternLower = (pattern || '').toLowerCase();
    const titleLower = title.toLowerCase();

    // Topic-based detection
    if (topicName.includes('tree') || topicName.includes('bst')) return 'tree';
    if (topicName.includes('graph')) return 'graph';
    if (topicName.includes('linked')) return 'linkedlist';
    if (topicName.includes('stack')) return 'stack';
    if (topicName.includes('queue')) return 'linkedlist';
    if (topicName.includes('heap')) return 'heap';
    if (topicName.includes('string')) return 'array';

    // Pattern-based detection
    if (patternLower.includes('hash')) return 'hashmap';
    if (patternLower.includes('two pointer') || patternLower.includes('sliding')) return 'slidingwindow';
    if (patternLower.includes('binary search')) return 'binarysearch';
    if (patternLower.includes('stack')) return 'stack';
    if (patternLower.includes('bfs') || patternLower.includes('dfs')) return 'tree';
    if (patternLower.includes('kadane') || patternLower.includes('prefix')) return 'array';

    // Title-based detection
    if (titleLower.includes('tree') || titleLower.includes('bst') || titleLower.includes('binary')) return 'tree';
    if (titleLower.includes('graph') || titleLower.includes('island')) return 'graph';
    if (titleLower.includes('linked list') || titleLower.includes('node')) return 'linkedlist';
    if (titleLower.includes('stack') || titleLower.includes('parenthes')) return 'stack';
    if (titleLower.includes('queue') || titleLower.includes('sliding')) return 'slidingwindow';
    if (titleLower.includes('search') && titleLower.includes('binary')) return 'binarysearch';

    // Default to array for most problems
    return 'array';
  };

  // Auto-generate sample_input from test cases or use defaults
  const autoGenerateSampleInput = (): string => {
    if (sample_input) return sample_input;
    const db = getDb();
    const testCases = db.testCases.filter(tc => tc.slug === slug);
    if (testCases.length > 0) {
      return testCases[0].input;
    }

    // Default sample inputs based on visualization type
    const vizType = visualization_type || autoDetectVizType();
    const defaults: Record<string, string> = {
      array: '[1,2,3,4,5]',
      hashmap: '["a","b","c"], target="b"',
      tree: '[3,9,20,null,null,15,7]',
      linkedlist: '[1,2,3,4,5]',
      graph: '[[1,2],[2,3],[3,4]]',
      stack: '()[]{}',
      queue: '[1,2,3,4,5]',
      binarysearch: '[1,2,3,4,5,6,7,8,9,10], target=5',
      slidingwindow: '[1,2,3,4,5,6,7], k=3',
      heap: '[3,1,4,1,5,9], k=3',
      dp: 'n=5',
    };
    return defaults[vizType] || '[1,2,3,4,5]';
  };

  // Auto-generate starter code from function signature or slug
  let starter_code: Record<string, string> | undefined;
  if (customStarterCode && Object.keys(customStarterCode).length > 0) {
    starter_code = customStarterCode;
  } else {
    const sig = getFunctionSignature(slug);
    if (sig) {
      starter_code = generateStarterCode(sig);
    } else {
      const fnName = slug.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
      starter_code = {
        javascript: `function ${fnName}(/* params */) {\n  \n}`,
        python: `def ${fnName}(/* params */):\n    pass`,
        java: `class Solution {\n    public void ${fnName}() {\n        \n    }\n}`,
        cpp: `class Solution {\npublic:\n    void ${fnName}() {\n        \n    }\n};`,
        c: `int ${fnName}() {\n    \n}`,
      };
    }
  }

  const newQuestion: Question = {
    id: String(db.questions.length + 1),
    title, slug, difficulty, topic_id: topic?.id || topic_id,
    topic_name: topic?.name || topic_id, pattern: pattern || 'N/A',
    description, starter_code,
    problem_statement, input_format, output_format, constraints, explanation,
    visualization_type: visualization_type || autoDetectVizType(),
    algorithm_type: algorithm_type || '',
    sample_input: autoGenerateSampleInput(),
    enable_visualization: enable_visualization ?? true,
    companies: companies || [],
    company_frequency: company_frequency || 'Medium',
    examples: examples || [],
  };
  addQuestion(newQuestion);

  // Add test cases if provided
  if (sample_tests && Array.isArray(sample_tests)) {
    const db = getDb();
    sample_tests.forEach((tc: any, i: number) => {
      if (tc.input && tc.output !== undefined) {
        addTestCase({
          id: String(i + 1),
          slug,
          input: tc.input,
          expected_output: tc.output,
          is_hidden: false,
        });
      }
    });
  }
  if (hidden_tests && Array.isArray(hidden_tests)) {
    hidden_tests.forEach((tc: any, i: number) => {
      if (tc.input && tc.output !== undefined) {
        addTestCase({
          id: String(i + 100),
          slug,
          input: tc.input,
          expected_output: tc.output,
          is_hidden: true,
        });
      }
    });
  }

  if (topic) {
    (topic as any).questionCount = ((topic as any).questionCount || 0) + 1;
  }

  res.status(201).json(newQuestion);
});

router.put('/questions/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.questions.find((q) => q.id === req.params.id || q.slug === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Question not found' });

  // Auto-detect visualization_type and sample_input if not provided
  const updates = { ...req.body };
  delete updates.sample_tests;
  delete updates.hidden_tests;
  delete updates.starter_code;

  if (req.body.starter_code && Object.keys(req.body.starter_code).length > 0) {
    updates.starter_code = req.body.starter_code;
  }

  if (!updates.visualization_type && !updates.sample_input) {
    const topicName = (existing.topic_name || '').toLowerCase();
    const patternLower = (existing.pattern || '').toLowerCase();
    const titleLower = existing.title.toLowerCase();

    let vizType = 'array';
    if (topicName.includes('tree') || topicName.includes('bst')) vizType = 'tree';
    else if (topicName.includes('graph')) vizType = 'graph';
    else if (topicName.includes('linked')) vizType = 'linkedlist';
    else if (topicName.includes('stack')) vizType = 'stack';
    else if (topicName.includes('queue')) vizType = 'linkedlist';
    else if (topicName.includes('heap')) vizType = 'heap';
    else if (patternLower.includes('hash')) vizType = 'hashmap';
    else if (patternLower.includes('binary search')) vizType = 'binarysearch';
    else if (patternLower.includes('sliding')) vizType = 'slidingwindow';

    if (!updates.visualization_type) updates.visualization_type = vizType;
    if (!updates.sample_input) {
      const testCases = db.testCases.filter(tc => tc.slug === existing.slug);
      if (testCases.length > 0) {
        updates.sample_input = testCases[0].input;
      } else {
        const defaults: Record<string, string> = {
          array: '[1,2,3,4,5]', hashmap: '["a","b","c"]', tree: '[3,9,20,null,null,15,7]',
          linkedlist: '[1,2,3,4,5]', graph: '[[1,2],[2,3]]', stack: '()[]{}',
          binarysearch: '[1,2,3,4,5,6,7,8,9,10], target=5',
          slidingwindow: '[1,2,3,4,5,6,7], k=3', heap: '[3,1,4,1,5,9], k=3', dp: 'n=5',
        };
        updates.sample_input = defaults[vizType] || '[1,2,3,4,5]';
      }
    }
  }

  const updated = updateQuestion(existing.slug, updates);

  // Update test cases if provided
  if (req.body.sample_tests || req.body.hidden_tests) {
    // Remove existing test cases for this slug
    const existingTestCases = db.testCases.filter(tc => tc.slug === existing.slug);
    existingTestCases.forEach(tc => deleteTestCase(tc.id));

    // Add new sample tests
    if (req.body.sample_tests && Array.isArray(req.body.sample_tests)) {
      req.body.sample_tests.forEach((tc: any, i: number) => {
        if (tc.input && tc.expected_output !== undefined) {
          addTestCase({
            id: String(i + 1),
            slug: existing.slug,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: false,
          });
        }
      });
    }
    // Add new hidden tests
    if (req.body.hidden_tests && Array.isArray(req.body.hidden_tests)) {
      req.body.hidden_tests.forEach((tc: any, i: number) => {
        if (tc.input && tc.expected_output !== undefined) {
          addTestCase({
            id: String(i + 100),
            slug: existing.slug,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: true,
          });
        }
      });
    }
  }

  res.json(updated);
});

router.delete('/questions/:id', (req: Request, res: Response) => {
  const deleted = deleteQuestion(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Question not found' });
  res.json({ success: true });
});

// ========== TEST CASES ==========
router.get('/questions/:slug/testcases', (req: Request, res: Response) => {
  const testCases = getTestCases(req.params.slug);
  res.json(testCases);
});

router.post('/questions/:slug/testcases', (req: Request, res: Response) => {
  const { input, expected_output, is_hidden } = req.body;
  if (!input || expected_output === undefined) {
    return res.status(400).json({ error: 'Input and expected_output required' });
  }

  const db = getDb();
  const existingIds = db.testCases.filter(tc => tc.slug === req.params.slug).map(tc => parseInt(tc.id));
  const nextId = existingIds.length > 0 ? String(Math.max(...existingIds) + 1) : '1';

  const newTc = {
    id: nextId,
    slug: req.params.slug,
    input,
    expected_output,
    is_hidden: is_hidden || false,
  };
  addTestCase(newTc);
  res.status(201).json(newTc);
});

router.put('/testcases/:id', (req: Request, res: Response) => {
  const { input, expected_output, is_hidden } = req.body;
  const updates: any = {};
  if (input !== undefined) updates.input = input;
  if (expected_output !== undefined) updates.expected_output = expected_output;
  if (is_hidden !== undefined) updates.is_hidden = is_hidden;

  const updated = updateTestCase(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Test case not found' });
  res.json(updated);
});

router.delete('/testcases/:id', (req: Request, res: Response) => {
  const deleted = deleteTestCase(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Test case not found' });
  res.json({ success: true });
});

// ========== CHEATSHEETS ==========
router.get('/cheatsheets', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.cheatSheets.map((c) => ({
    question_id: c.question_id, pattern: c.pattern,
  })));
});

router.get('/cheatsheets/:id', (req: Request, res: Response) => {
  const db = getDb();
  const cs = db.cheatSheets.find((c) => c.question_id === req.params.id);
  if (!cs) return res.status(404).json({ error: 'Cheat sheet not found' });
  res.json(cs);
});

router.post('/cheatsheets', (req: Request, res: Response) => {
  const { question_id, pattern, recognition, approach, approach_steps, approach_diagram, approach_images, time_complexity, space_complexity, template, mistakes } = req.body;
  if (!question_id || !pattern) {
    return res.status(400).json({ error: 'question_id and pattern required' });
  }

  const db = getDb();
  const newCheatSheet: CheatSheet = {
    question_id, pattern,
    recognition: recognition || [],
    approach: approach || '',
    approach_steps: approach_steps || ['Analyze the problem', 'Implement the solution'],
    approach_diagram: approach_diagram || 'Problem -> Solution',
    approach_images: approach_images || [],
    complexity: { time: time_complexity || 'N/A', space: space_complexity || 'N/A' },
    template: template || { javascript: '// Code template coming soon' },
    mistakes: mistakes || [],
  };
  db.cheatSheets.push(newCheatSheet);
  saveDb();
  res.status(201).json(newCheatSheet);
});

router.put('/cheatsheets/:id', (req: Request, res: Response) => {
  const db = getDb();
  const idx = db.cheatSheets.findIndex((c) => c.question_id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Cheat sheet not found' });
  db.cheatSheets[idx] = { ...db.cheatSheets[idx], ...req.body };
  saveDb();
  res.json(db.cheatSheets[idx]);
});

// ========== USERS ==========
router.get('/users', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.users.map((u) => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    created_at: u.created_at,
  })));
});

router.put('/users/:id', (req: Request, res: Response) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.params.id || u.email === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { role } = req.body;
  if (role) user.role = role;
  saveDb();
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ========== TOPICS ==========
router.post('/topics', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const newTopic = { id: String(db.topics.length + 1), name, slug, description: '', questionCount: 0 };
  addTopic(newTopic);
  res.status(201).json(newTopic);
});

router.put('/topics/:id', (req: Request, res: Response) => {
  const db = getDb();
  const topic = db.topics.find((t) => t.id === req.params.id || t.slug === req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  const updates: any = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  const updated = updateTopic(topic.slug, updates);
  res.json(updated);
});

router.delete('/topics/:id', (req: Request, res: Response) => {
  const db = getDb();
  const topic = db.topics.find((t) => t.id === req.params.id || t.slug === req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  deleteTopic(topic.slug);
  res.json({ success: true });
});

// ========== SHOP PRODUCTS ==========
router.get('/shop/products', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.shopProducts || []);
});

router.get('/shop/products/:id', (req: Request, res: Response) => {
  const db = getDb();
  const product = (db.shopProducts || []).find((p: ShopProduct) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/shop/products', (req: Request, res: Response) => {
  const { title, description, category, price, icon, color, tags, popular, pages, author, download_url } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Title and category required' });
  const db = getDb();
  const id = 'sp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();
  const product: ShopProduct = {
    id, title, description: description || '', category, price: price || 'free',
    icon: icon || '📦', color: color || 'from-slate-500 to-slate-600',
    tags: tags || [], popular: !!popular, pages, author, download_url,
    created_at: now, updated_at: now,
  };
  db.shopProducts = db.shopProducts || [];
  db.shopProducts.push(product);
  saveDb();
  res.status(201).json(product);
});

router.put('/shop/products/:id', (req: Request, res: Response) => {
  const db = getDb();
  const idx = (db.shopProducts || []).findIndex((p: ShopProduct) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });
  const existing = db.shopProducts[idx];
  const updates = req.body;
  db.shopProducts[idx] = {
    ...existing, ...updates,
    id: existing.id, updated_at: new Date().toISOString(),
  };
  saveDb();
  res.json(db.shopProducts[idx]);
});

router.delete('/shop/products/:id', (req: Request, res: Response) => {
  const db = getDb();
  const idx = (db.shopProducts || []).findIndex((p: ShopProduct) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });
  db.shopProducts.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

export default router;
