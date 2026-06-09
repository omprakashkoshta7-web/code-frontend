import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getDb, saveDb } from '../data/db';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import type { ParsedResume, ResumeSection, ResumeScore, ResumeAnalysis, ResumeTemplate } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ====== RESUME TEMPLATES ======
const TEMPLATES: ResumeTemplate[] = [
  { id: 'ats-beginner', name: 'ATS Beginner', description: 'Clean single-column layout optimized for ATS parsers', category: 'ats-beginner', preview: '/resume-templates/ats-beginner.png', is_ats_friendly: true, columns: 1, colors: ['#1e293b', '#f8fafc', '#ffffff'] },
  { id: 'sde', name: 'SDE Resume', description: 'Software engineering focused with technical skills emphasis', category: 'sde', preview: '/resume-templates/sde.png', is_ats_friendly: true, columns: 1, colors: ['#0f172a', '#e2e8f0', '#ffffff'] },
  { id: 'frontend', name: 'Frontend Resume', description: 'Modern layout with visual portfolio & project highlights', category: 'frontend', preview: '/resume-templates/frontend.png', is_ats_friendly: false, columns: 2, colors: ['#312e81', '#f0f9ff', '#ffffff'] },
  { id: 'backend', name: 'Backend Resume', description: 'System design & architecture focused clean format', category: 'backend', preview: '/resume-templates/backend.png', is_ats_friendly: true, columns: 1, colors: ['#1e3a5f', '#f1f5f9', '#ffffff'] },
  { id: 'ai-ml', name: 'AI/ML Resume', description: 'Research & model-focused layout for data scientists', category: 'ai-ml', preview: '/resume-templates/ai-ml.png', is_ats_friendly: false, columns: 2, colors: ['#581c87', '#fdf4ff', '#ffffff'] },
  { id: 'fullstack', name: 'Full Stack Resume', description: 'Versatile format balancing frontend & backend skills', category: 'fullstack', preview: '/resume-templates/fullstack.png', is_ats_friendly: true, columns: 1, colors: ['#0d9488', '#f0fdfa', '#ffffff'] },
];

// ====== RULE ENGINE ======
interface Rule { id: string; section: string; label: string; check: (sections: ResumeSection[], text: string) => boolean; points: number; }

const RULES: Rule[] = [
  { id: 'linkedin', section: 'basic_info', label: 'LinkedIn URL present', check: (_, t) => /linkedin\.com\/in\//i.test(t), points: 5 },
  { id: 'github', section: 'basic_info', label: 'GitHub URL present', check: (_, t) => /github\.com\//i.test(t), points: 5 },
  { id: 'portfolio', section: 'basic_info', label: 'Portfolio URL present', check: (_, t) => /portfolio|vercel\.app|netlify\.app/i.test(t) || /(?:https?:\/\/)?[\w-]+\.(?:com|dev|app)/i.test(t), points: 5 },
  { id: 'phone', section: 'basic_info', label: 'Phone number present', check: (_, t) => /[\+\d\s\-\(\)]{10,}/i.test(t), points: 3 },
  { id: 'email', section: 'basic_info', label: 'Email present', check: (_, t) => /[\w.-]+@[\w.-]+\.\w+/i.test(t), points: 3 },
  { id: 'projects_3plus', section: 'projects', label: '3+ Projects', check: (s) => { const p = s.find(x => x.type === 'projects'); return p ? (p.items?.length || 1) >= 3 : false; }, points: 10 },
  { id: 'project_metrics', section: 'projects', label: 'Project metrics/impact', check: (_, t) => /\d+%|\d+x|\d+ users|\d+ requests|\d+ ms|\d+ stars/i.test(t), points: 10 },
  { id: 'github_links_projects', section: 'projects', label: 'GitHub links in projects', check: (_, t) => /github\.com/i.test(t) && /\b(?:project|app|built|developed|created)\b/i.test(t), points: 5 },
  { id: 'dsa_mentioned', section: 'skills', label: 'DSA mentioned', check: (_, t) => /\b(dsa|data structure|algorithm|leetcode|codeforces|codechef)\b/i.test(t), points: 5 },
  { id: 'sql_mentioned', section: 'skills', label: 'SQL mentioned', check: (_, t) => /\b(sql|database|postgresql|mysql|mongodb)\b/i.test(t), points: 5 },
  { id: 'git_mentioned', section: 'skills', label: 'Git mentioned', check: (_, t) => /\bgit|github|version control\b/i.test(t), points: 5 },
  { id: 'experience_metrics', section: 'experience', label: 'Experience with metrics', check: (_, t) => /\b(?:led|managed|increased|decreased|reduced|improved|delivered)\b.*\d+/i.test(t), points: 10 },
  { id: 'education_bachelors', section: 'education', label: 'Bachelor\'s degree or higher', check: (_, t) => /\b(bachelor|b\.?tech|b\.?e|b\.?s|master|m\.?tech|m\.?s|phd|ph\.?d)\b/i.test(t), points: 5 },
  { id: 'ats_single_column', section: 'ats', label: 'Single column layout', check: (_, t) => { const lines = t.split('\n').filter(l => l.trim()); const avgLen = lines.reduce((a, l) => a + l.length, 0) / (lines.length || 1); return avgLen > 40; }, points: 10 },
  { id: 'ats_no_tables', section: 'ats', label: 'No tables detected', check: (_, t) => !/─+.*─+|┌|┐|└|┘|├|┤|┬|┴|┼|\|\s*[A-Z]+\s*\|/.test(t), points: 10 },
  { id: 'ats_readable_font', section: 'ats', label: 'Readable font size indicators', check: (_, t) => t.split('\n').filter(l => l.trim().length > 20).length > 15, points: 5 },
];

function calcScore(sections: ResumeSection[], rawText: string): ResumeScore {
  let basicInfo = 0, projects = 0, skills = 0, experience = 0, education = 0, ats = 0;
  for (const rule of RULES) {
    if (rule.check(sections, rawText)) {
      switch (rule.section) {
        case 'basic_info': basicInfo += rule.points; break;
        case 'projects': projects += rule.points; break;
        case 'skills': skills += rule.points; break;
        case 'experience': experience += rule.points; break;
        case 'education': education += rule.points; break;
        case 'ats': ats += rule.points; break;
      }
    }
  }
  const total = Math.min(100, basicInfo + projects + skills + experience + education + ats);
  return { total, breakdown: { basic_info: basicInfo, projects: projects, skills: skills, experience: experience, education: education, ats: ats } };
}

// ====== TEXT EXTRACTION ======
async function extractTextFromBuffer(buffer: Buffer, mime: string): Promise<string> {
  if (mime === 'application/pdf' || mime.includes('pdf')) {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch { return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ''); }
  }
  if (mime.includes('word') || mime.includes('docx') || mime.includes('officedocument')) {
    try {
      const mammoth = require('mammoth');
      const r = await mammoth.extractRawText({ buffer });
      return r.value || '';
    } catch { return buffer.toString('utf-8'); }
  }
  return buffer.toString('utf-8');
}

function extractSections(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) sections.push({ type: 'email', value: emailMatch[0] });

  const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
  if (phoneMatch) sections.push({ type: 'phone', value: phoneMatch[0].trim() });

  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) sections.push({ type: 'linkedin', value: linkedinMatch[0] });

  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) sections.push({ type: 'github', value: githubMatch[0] });

  const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
  if (nameMatch) sections.push({ type: 'name', value: nameMatch[1] });

  const skillKeywords = ['python', 'javascript', 'typescript', 'java', 'c++', 'react', 'node', 'angular', 'vue', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'sql', 'mongodb', 'redis', 'graphql', 'rest', 'git', 'linux', 'html', 'css', 'tailwind', 'sass', 'express', 'django', 'flask', 'spring', 'next', 'nuxt', 'nestjs'];
  const foundSkills = skillKeywords.filter(sk => new RegExp('\\b' + sk.replace(/[+\/]/g, '\\$&') + '\\b', 'i').test(text));
  if (foundSkills.length > 0) sections.push({ type: 'skills', value: foundSkills.join(', '), items: foundSkills });

  const eduKeywords = ['bachelor', 'b.tech', 'b.e', 'master', 'm.tech', 'm.s', 'phd', 'ph.d', 'bca', 'mca', 'degree', 'university', 'college', 'school', 'institute', 'b.sc', 'm.sc'];
  const eduLines = text.split('\n').filter(l => eduKeywords.some(k => l.toLowerCase().includes(k)));
  if (eduLines.length > 0) sections.push({ type: 'education', value: eduLines.join('; '), items: eduLines.map(l => l.trim()) });

  return sections;
}

// ====== AI ANALYSIS ======
async function callOllama(prompt: string): Promise<string> {
  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, options: { num_predict: 2048 } }),
  });
  if (!r.ok) throw new Error(`Ollama error: ${r.status}`);
  const d = await r.json();
  return d.response || '';
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2048 } }),
  });
  if (!r.ok) throw new Error(`Gemini error: ${r.status}`);
  const d = await r.json();
  return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function analyzeWithAI(text: string): Promise<{ analysis: Omit<ResumeAnalysis, 'rewrite_suggestions'>; rewrites: { original: string; rewritten: string }[] }> {
  const prompt = `Analyze this resume text. Return STRICT JSON only (no markdown). Format:
{
  "strength": "Low"|"Medium"|"High",
  "weak_areas": ["..."],
  "missing_sections": ["..."],
  "ats_improvements": ["..."],
  "project_suggestions": ["..."],
  "skill_suggestions": ["..."],
  "template_recommendation": "...",
  "ats_friendly": number(0-100),
  "project_score": number(0-10),
  "rewrites": [{"original": "...existing bullet...", "rewritten": "...improved..."}]
}

Resume:
${text.slice(0, 8000)}`;

  let raw: string;
  try {
    raw = await callOllama(prompt);
  } catch {
    try {
      raw = await callGemini(prompt);
    } catch {
      raw = '{}';
    }
  }

  try {
    const cleaned = raw.replace(/```(?:json)?\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      analysis: {
        strength: parsed.strength || 'Medium',
        weak_areas: parsed.weak_areas || [],
        missing_sections: parsed.missing_sections || [],
        ats_improvements: parsed.ats_improvements || [],
        project_suggestions: parsed.project_suggestions || [],
        skill_suggestions: parsed.skill_suggestions || [],
        template_recommendation: parsed.template_recommendation || 'ATS Beginner',
        ats_friendly: parsed.ats_friendly || 70,
        project_score: parsed.project_score || 5,
      },
      rewrites: parsed.rewrites || [],
    };
  } catch {
    return {
      analysis: {
        strength: 'Medium', weak_areas: ['Could not parse AI response'], missing_sections: [], ats_improvements: [],
        project_suggestions: [], skill_suggestions: [], template_recommendation: 'ATS Beginner', ats_friendly: 70, project_score: 5,
      },
      rewrites: [],
    };
  }
}

// ====== ROUTES ======

router.post('/upload', authenticate, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
    const sections = extractSections(rawText);
    const score = calcScore(sections, rawText);

    const parsed: ParsedResume = {
      id: uuidv4(),
      user_id: req.user!.id,
      title: `Resume - ${new Date().toLocaleDateString()}`,
      raw_text: rawText,
      sections,
      score,
      created_at: new Date().toISOString(),
    };

    const db = getDb();
    db.resumes = db.resumes || [];
    db.resumes.push(parsed);
    saveDb();

    res.json({ resume: parsed });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

router.post('/analyze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id, text } = req.body;
    let rawText = text || '';

    if (resume_id) {
      const db = getDb();
      const found = (db.resumes || []).find(r => r.id === resume_id && r.user_id === req.user!.id);
      if (!found) return res.status(404).json({ error: 'Resume not found' });
      rawText = found.raw_text;
    }

    if (!rawText) return res.status(400).json({ error: 'No text to analyze' });

    const sections = extractSections(rawText);
    const score = calcScore(sections, rawText);
    const { analysis, rewrites } = await analyzeWithAI(rawText);

    const fullAnalysis: ResumeAnalysis = { ...analysis, rewrite_suggestions: rewrites };

    if (resume_id) {
      const db = getDb();
      const found = (db.resumes || []).find(r => r.id === resume_id);
      if (found) { found.score = score; found.analysis = fullAnalysis; saveDb(); }
    }

    res.json({ score, analysis: fullAnalysis, sections });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Analysis failed' });
  }
});

router.get('/list', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const list = (db.resumes || []).filter(r => r.user_id === req.user!.id).map(r => ({
    id: r.id, title: r.title, score: r.score?.total || null, created_at: r.created_at, sections: r.sections,
  }));
  res.json({ resumes: list });
});

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const found = (db.resumes || []).find(r => r.id === req.params.id && r.user_id === req.user!.id);
  if (!found) return res.status(404).json({ error: 'Resume not found' });
  res.json(found);
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const idx = (db.resumes || []).findIndex(r => r.id === req.params.id && r.user_id === req.user!.id);
  if (idx < 0) return res.status(404).json({ error: 'Resume not found' });
  db.resumes.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

router.get('/templates', (_req: Request, res: Response) => {
  res.json({ templates: TEMPLATES });
});

router.post('/rewrite', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text: bulletText } = req.body;
    if (!bulletText) return res.status(400).json({ error: 'Text required' });
    const prompt = `Rewrite this resume bullet point to be more impactful with metrics and strong action verbs. Return ONLY the rewritten version, no explanations.\n\nOriginal: ${bulletText}\n\nRewritten:`;
    let rewritten = '';
    try { rewritten = await callOllama(prompt); } catch { rewritten = bulletText; }
    res.json({ original: bulletText, rewritten: rewritten.trim() });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Rewrite failed' });
  }
});

export default router;
