#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${1:-/var/www/nardy-vision}"

cd "${APP_DIR}"

echo "[1/6] Pulling latest code"
git pull

echo "[2/6] Installing dependencies"
npm install

echo "[3/6] Generating Prisma client"
npx prisma generate --schema prisma/schema.prisma

echo "[4/6] Applying schema"
npm run db:push

echo "[5/6] Building application"
npm run build

echo "[6/6] Restarting PM2 process"
pm2 restart nardy-vision

echo "Update complete."
