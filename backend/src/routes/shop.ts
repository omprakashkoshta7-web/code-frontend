import { Router, Request, Response } from 'express';
import { getDb, saveDb } from '../data/db';
import type { ShopProduct } from '../types';

const router = Router();

const SEED_PRODUCTS: ShopProduct[] = [
  { id: 'p1', title: 'DSA Cheat Sheet 2025', description: 'Complete DSA cheat sheet with code snippets, time complexities, and pattern recognition for all major topics.', category: 'pdf', price: { amount: 0, label: 'Free' }, icon: '📄', color: 'from-blue-500 to-cyan-500', tags: ['dsa', 'algorithms', 'patterns'], author: 'CodeSprout Team', pages: 48 },
  { id: 'p2', title: 'System Design Interview Guide', description: 'Comprehensive guide covering distributed systems, scalability, caching, databases, and real-world architecture patterns.', category: 'pdf', price: { amount: 499, label: '₹499' }, icon: '📄', color: 'from-purple-500 to-indigo-500', tags: ['system-design', 'architecture', 'scalability'], popular: true, author: 'Senior Engineers', pages: 120 },
  { id: 'p3', title: 'JavaScript Interview Handbook', description: 'Deep dive into closures, event loop, promises, prototypes, and 50+ JS coding problems with solutions.', category: 'pdf', price: { amount: 299, label: '₹299' }, icon: '📄', color: 'from-yellow-500 to-orange-500', tags: ['javascript', 'frontend', 'coding'], author: 'JS Masters', pages: 85 },
  { id: 'p4', title: 'React Performance Cookbook', description: 'Optimization techniques, memoization patterns, code splitting, and rendering strategies for production React apps.', category: 'pdf', price: { amount: 399, label: '₹399' }, icon: '📄', color: 'from-cyan-500 to-blue-500', tags: ['react', 'performance', 'frontend'], author: 'React Core Contributors', pages: 64 },
  { id: 'n1', title: 'DSA Core Concepts Notes', description: 'Hand-written style notes covering arrays, linked lists, trees, graphs, DP with clear explanations and diagrams.', category: 'notes', price: 'free', icon: '📝', color: 'from-emerald-500 to-teal-500', tags: ['dsa', 'core-concepts'], author: 'CodeSprout', pages: 32 },
  { id: 'n2', title: 'SQL Mastery Notes', description: 'From basic queries to advanced window functions, query optimization, and database design patterns with real examples.', category: 'notes', price: { amount: 199, label: '₹199' }, icon: '📝', color: 'from-sky-500 to-blue-500', tags: ['sql', 'database'], author: 'DB Experts', pages: 55 },
  { id: 'n3', title: 'Machine Learning Fundamentals', description: 'Supervised, unsupervised, feature engineering, model evaluation, and deployment notes with Python code.', category: 'notes', price: { amount: 599, label: '₹599' }, icon: '📝', color: 'from-red-500 to-rose-500', tags: ['ml', 'python'], popular: true, author: 'AI Team', pages: 90 },
  { id: 'i1', title: 'FAANG Interview Blueprint', description: 'Step-by-step interview strategy, what to expect, preparation timeline, and insider tips from FAANG engineers.', category: 'interview-notes', price: { amount: 0, label: 'Free' }, icon: '🎤', color: 'from-pink-500 to-rose-500', tags: ['faang', 'strategy'], author: 'FAANG Engineers', pages: 40 },
  { id: 'i2', title: '100 Behavioral Questions STAR', description: '100+ behavioral questions with STAR-format answers, covering leadership, conflict, failure, teamwork, and pressure scenarios.', category: 'interview-notes', price: { amount: 249, label: '₹249' }, icon: '🎤', color: 'from-amber-500 to-yellow-500', tags: ['behavioral', 'star'], popular: true, author: 'HR Experts', pages: 75 },
  { id: 'i3', title: 'Telephonic & HR Round Notes', description: 'Common HR questions, negotiation tips, salary discussion, and how to ace the telephonic screening round.', category: 'interview-notes', price: 'free', icon: '🎤', color: 'from-violet-500 to-purple-500', tags: ['hr', 'telephonic'], author: 'CodeSprout', pages: 28 },
  { id: 'c1', title: 'Google Interview Questions Bank', description: 'Curated set of 200+ Google-specific questions across coding, system design, and behavioral rounds with solutions.', category: 'company-specific', price: { amount: 999, label: '₹999' }, icon: '🏢', color: 'from-blue-600 to-blue-800', tags: ['google', 'coding', 'system-design'], popular: true, author: 'Google Alumni', pages: 150 },
  { id: 'c2', title: 'Amazon Leadership Principles Guide', description: 'Detailed guide to 16 Amazon leadership principles with example stories, common questions, and evaluation criteria.', category: 'company-specific', price: { amount: 699, label: '₹699' }, icon: '🏢', color: 'from-orange-500 to-amber-600', tags: ['amazon', 'leadership', 'behavioral'], author: 'Amazon SDEs', pages: 80 },
  { id: 'c3', title: 'Microsoft Interview Prep Pack', description: 'Microsoft-specific coding patterns, system design topics, and cultural fit questions collected from recent interviews.', category: 'company-specific', price: { amount: 599, label: '₹599' }, icon: '🏢', color: 'from-blue-500 to-indigo-600', tags: ['microsoft', 'coding'], author: 'Microsoft Engineers', pages: 95 },
  { id: 'c4', title: 'Startup Interview Questions', description: 'Questions commonly asked at high-growth startups, full-stack challenges, product sense, and hands-on coding.', category: 'company-specific', price: { amount: 0, label: 'Free' }, icon: '🏢', color: 'from-green-500 to-emerald-600', tags: ['startup', 'general'], author: 'Startup CTOs', pages: 35 },
];

function seedIfEmpty(): void {
  const db = getDb();
  if (!db.shopProducts || db.shopProducts.length === 0) {
    const now = new Date().toISOString();
    db.shopProducts = SEED_PRODUCTS.map(p => ({ ...p, created_at: now, updated_at: now }));
    saveDb();
  }
}

router.get('/products', (req: Request, res: Response) => {
  seedIfEmpty();
  const db = getDb();
  const { category, search, free } = req.query;
  let result = [...db.shopProducts];
  if (category && category !== 'all') result = result.filter(p => p.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
  }
  if (free === 'true') result = result.filter(p => p.price === 'free' || (typeof p.price === 'object' && p.price.amount === 0));
  res.json({ products: result, total: result.length, categories: [...new Set(db.shopProducts.map((p: ShopProduct) => p.category))] });
});

router.get('/products/:id', (req: Request, res: Response) => {
  seedIfEmpty();
  const db = getDb();
  const product = db.shopProducts.find((p: ShopProduct) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

export default router;
