import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import multer from 'multer';
// pdf-parse and mammoth are loaded via require() in extractText()

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust proxy for correct IP when behind NGINX/reverse proxy
app.set('trust proxy', 1);

app.use(cors({
  origin: (_origin, callback) => callback(null, _origin || true),
  credentials: true,
}));

// Auth-specific rate limiter (stricter — login/register/Google OAuth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { error: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);
app.use('/auth', authLimiter);

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'OPTIONS' ||
    req.path === '/health' ||
    req.path.startsWith('/api/notifications') ||
    req.path.startsWith('/notifications') ||
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/auth'),
  keyGenerator: (req: any) => {
    const token = req.headers['authorization'];
    if (token) return token;
    return req.ip;
  },
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

const notificationsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/notifications', notificationsLimiter);
app.use('/notifications', notificationsLimiter);

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
  social: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3003',
  execution: process.env.EXECUTION_SERVICE_URL || 'http://localhost:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  resume: process.env.RESUME_SERVICE_URL || 'http://localhost:3006',
};

const proxies = new Map<string, ReturnType<typeof createProxyMiddleware>>();

const getProxy = (target: string) => {
  let proxy = proxies.get(target);
  if (!proxy) {
    proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      proxyTimeout: 60000,
      timeout: 60000,
      pathRewrite: (_path: string, req: any) => req.originalUrl,
      on: {
        error: (err: any, _req: any, res: any) => {
          console.error(`[gateway] proxy error to ${target}:`, err.message);
          if (!res.headersSent) res.status(502).json({ error: 'Service unavailable', service: target });
        },
        proxyRes: (proxyRes: any, req: any, _res: any) => {
          const origin = req.headers['origin'];
          if (origin) {
            proxyRes.headers['access-control-allow-origin'] = origin;
            proxyRes.headers['access-control-allow-credentials'] = 'true';
            proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, X-User-Id, x-user-id, x-requested-with';
          }
        },
      },
    });
    proxies.set(target, proxy);
  }
  return proxy;
};

app.get('/health', (_req, res) => res.json({
  service: 'gateway',
  status: 'ok',
  timestamp: new Date().toISOString(),
  services: SERVICES,
}));

// ====== Resume Templates (served directly from gateway) ======
const RESUME_TEMPLATES = [
  { id: 'ats-beginner', name: 'ATS Beginner', description: 'Clean single-column layout optimized for ATS parsers', is_ats_friendly: true, columns: 1, colors: ['#1e293b', '#f8fafc', '#ffffff'] },
  { id: 'sde', name: 'SDE Resume', description: 'Software engineering focused with technical skills emphasis', is_ats_friendly: true, columns: 1, colors: ['#0f172a', '#e2e8f0', '#ffffff'] },
  { id: 'frontend', name: 'Frontend Resume', description: 'Modern layout with visual portfolio & project highlights', is_ats_friendly: false, columns: 2, colors: ['#312e81', '#f0f9ff', '#ffffff'] },
  { id: 'backend', name: 'Backend Resume', description: 'System design & architecture focused clean format', is_ats_friendly: true, columns: 1, colors: ['#1e3a5f', '#f1f5f9', '#ffffff'] },
  { id: 'ai-ml', name: 'AI/ML Resume', description: 'Research & model-focused layout for data scientists', is_ats_friendly: false, columns: 2, colors: ['#581c87', '#fdf4ff', '#ffffff'] },
  { id: 'fullstack', name: 'Full Stack Resume', description: 'Versatile format balancing frontend & backend skills', is_ats_friendly: true, columns: 1, colors: ['#0d9488', '#f0fdfa', '#ffffff'] },
];

const extractText = async (buffer: Buffer, mime: string): Promise<string> => {
  if (mime.includes('pdf')) {
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
};

const extractSections = (text: string) => {
  const sections: any[] = [];
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
  const foundSkills = skillKeywords.filter((sk: string) => new RegExp('\\b' + sk.replace(/[+\/]/g, '\\$&') + '\\b', 'i').test(text));
  if (foundSkills.length > 0) sections.push({ type: 'skills', value: foundSkills.join(', '), items: foundSkills });
  const eduKeywords = ['bachelor', 'b.tech', 'b.e', 'master', 'm.tech', 'm.s', 'phd', 'ph.d', 'bca', 'mca', 'degree', 'university', 'college', 'school', 'institute', 'b.sc', 'm.sc'];
  const eduLines = text.split('\n').filter((l: string) => eduKeywords.some((k: string) => l.toLowerCase().includes(k)));
  if (eduLines.length > 0) sections.push({ type: 'education', value: eduLines.join('; '), items: eduLines.map((l: string) => l.trim()) });
  return sections;
};

const resumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const handle = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;

  // Resume templates served directly from gateway
  if (path === '/resume/templates') {
    return res.json({ templates: RESUME_TEMPLATES });
  }

  // Resume list — return empty (resume microservice DB not available via gateway)
  if (path === '/resume/list') {
    return res.json({ resumes: [] });
  }

  // Resume analyze — return error (AI analysis only available via resume microservice)
  if (path === '/resume/analyze') {
    return res.status(503).json({ error: 'Resume analysis service unavailable. Please try again later.' });
  }

  // Resume rewrite — return error (AI rewrite only available via resume microservice)
  if (path === '/resume/rewrite') {
    return res.status(503).json({ error: 'Resume rewrite service unavailable. Please try again later.' });
  }

  // Resume upload & parse served directly from gateway
  if (path === '/resume/upload') {
    return resumeUpload.single('resume')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: 'Upload error', details: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      try {
        const text = await extractText(req.file.buffer, req.file.mimetype);
        const sections = extractSections(text);
        res.json({ sections, text, filename: req.file.originalname });
      } catch (e: any) {
        res.status(500).json({ error: 'Failed to parse resume', details: e.message });
      }
    });
  }

  let target: string | null = null;
  if (path.startsWith('/auth') || path.startsWith('/notifications') || path.startsWith('/email')) target = SERVICES.auth;
  else if (path.startsWith('/topics') || path.startsWith('/questions') || path.startsWith('/patterns') || path.startsWith('/stats') || path.startsWith('/shop')) target = SERVICES.content;
  else if (path.startsWith('/bookmarks') || path.startsWith('/dashboard') || path.startsWith('/leaderboard')) target = SERVICES.social;
  else if (path.startsWith('/interview-prep')) target = SERVICES.social;
  else if (path.startsWith('/subscription')) target = SERVICES.payment;
  else if (path.startsWith('/communities') || path.startsWith('/answers') || path.startsWith('/chat') || path.startsWith('/discussions') || path.startsWith('/progress') || path.startsWith('/notes') || path.startsWith('/interviews') || path.startsWith('/resources') || path.startsWith('/contests') || path.startsWith('/roadmaps') || path.startsWith('/challenges') || path.startsWith('/points')) target = SERVICES.social;
  else if (path.startsWith('/execute') || path.startsWith('/upload')) target = SERVICES.execution;
  else if (path.startsWith('/resume')) target = SERVICES.resume;
  else if (path.startsWith('/payments')) target = SERVICES.payment;
  else if (path.startsWith('/admin')) {
    if (path.startsWith('/admin/ai') || path.startsWith('/admin/patterns')) target = SERVICES.execution;
    else if (path.startsWith('/admin/payments') || path.startsWith('/admin/requests')) target = SERVICES.payment;
    else target = SERVICES.content;
  }

  if (!target) return res.status(404).json({ error: 'Route not found', path });
  console.log(`[gateway] ${req.method} ${req.originalUrl} -> ${target}`);
  return getProxy(target)(req, res, next);
};

app.options('/api/*', (_req: Request, res: Response) => {
  res.status(204).end();
});
app.use('/api', handle);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`[gateway] running on http://localhost:${PORT}`);
  console.log(`[gateway] routing to:`);
  Object.entries(SERVICES).forEach(([name, url]) => console.log(`  - ${name}: ${url}`));
}).setMaxListeners(50);
