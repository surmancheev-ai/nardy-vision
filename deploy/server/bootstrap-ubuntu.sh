#!/usr/bin/env bash

set -euo pipefail

echo "[1/6] Updating package index"
sudo apt update

echo "[2/6] Upgrading installed packages"
sudo apt upgrade -y

echo "[3/6] Installing base packages"
sudo apt install -y curl git unzip build-essential nginx certbot python3-certbot-nginx ufw postgresql postgresql-contrib

echo "[4/6] Installing Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

echo "[5/6] Installing PM2"
sudo npm install -g pm2

echo "[6/6] Versions"
node -v
npm -v
pm2 -v
psql --version

echo "Bootstrap complete."
