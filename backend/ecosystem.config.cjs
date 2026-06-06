/**
 * PM2 ecosystem config — runs all 6 CodeSprout microservices with auto-restart,
 * logs, and graceful reload. Use on VPS/Docker/local; Render handles this itself.
 *
 * Start:   pm2 start ecosystem.config.cjs
 * Status:  pm2 list
 * Logs:    pm2 logs
 * Monitor: pm2 monit
 * Stop:    pm2 stop all
 * Delete:  pm2 delete all
 * Save:    pm2 save && pm2 startup
 */
const path = require('path');

const services = [
  { name: 'codesprout-gateway',    script: 'dist/services/gateway.js',    port: 3000 },
  { name: 'codesprout-auth',       script: 'dist/services/auth.js',       port: 3001 },
  { name: 'codesprout-content',    script: 'dist/services/content.js',    port: 3002 },
  { name: 'codesprout-social',     script: 'dist/services/social.js',     port: 3003 },
  { name: 'codesprout-execution',  script: 'dist/services/execution.js',  port: 3004 },
  { name: 'codesprout-payment',    script: 'dist/services/payment.js',    port: 3005 },
];

const buildEnv = (service) => ({
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: String(service.port),
  JWT_SECRET: process.env.JWT_SECRET || '',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  MONGODB_URL: process.env.MONGODB_URL || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || 'http://127.0.0.1:3002',
  SOCIAL_SERVICE_URL: process.env.SOCIAL_SERVICE_URL || 'http://127.0.0.1:3003',
  EXECUTION_SERVICE_URL: process.env.EXECUTION_SERVICE_URL || 'http://127.0.0.1:3004',
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3005',
  JUDGE0_URL: process.env.JUDGE0_URL || '',
  JUDGE0_KEY: process.env.JUDGE0_KEY || '',
  UPI_ID: process.env.UPI_ID || '',
});

module.exports = {
  apps: services.map((s) => ({
    name: s.name,
    script: path.join(__dirname, s.script),
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    restart_delay: 2000,
    max_restarts: 20,
    min_uptime: '30s',
    max_memory_restart: '512M',
    kill_timeout: 8000,
    wait_ready: false,
    listen_timeout: 15000,
    env: buildEnv(s),
    out_file: path.join(__dirname, 'logs', `${s.name}-out.log`),
    error_file: path.join(__dirname, 'logs', `${s.name}-error.log`),
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  })),

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-vps.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:omprakashkoshta7-web/code-frontend.git',
      path: '/var/www/codesprout',
      'pre-deploy': 'git fetch --all',
      'post-deploy':
        'npm ci --prefix backend && npm run build --prefix backend && pm2 reload ecosystem.config.cjs --env production',
    },
  },
};
