import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

const handle = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
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
