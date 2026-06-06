#!/usr/bin/env bash
# Build + start all CodeSprout microservices with PM2 (production).
# Usage:  ./scripts/pm2-start.sh

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Installing backend deps"
npm ci --prefix backend

echo "==> Building TypeScript"
npm run build --prefix backend

mkdir -p backend/logs

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> PM2 not found, installing globally"
  npm install -g pm2
fi

echo "==> Starting microservices via PM2"
cd backend
pm2 start ecosystem.config.cjs

echo "==> Saving process list for reboot restore"
pm2 save

echo ""
echo "==> Status:"
pm2 list
echo ""
echo "Useful commands:"
echo "  pm2 logs                # follow all logs"
echo "  pm2 logs codesprout-payment   # specific service"
echo "  pm2 monit               # CPU/memory monitor"
echo "  pm2 restart all         # rolling restart"
echo "  pm2 reload all          # zero-downtime reload (only with cluster mode)"
echo "  pm2 stop all            # stop everything"
echo "  pm2 delete all          # remove from PM2 list"
echo "  pm2 startup             # generate systemd startup script"
