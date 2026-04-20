# Deployment Guide For Beginners

For the more practical checklist version, use:

- [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)

Server helper scripts are available in:

- `deploy/server/bootstrap-ubuntu.sh`
- `deploy/server/create-deploy-user.sh`
- `deploy/server/deploy-update.sh`
- `deploy/server/smoke-test.sh`

This guide explains how to put Nardy Vision on a real server.

The current recommended path is:
- Linux VPS
- Ubuntu 24.04 LTS
- Node.js app
- PostgreSQL
- Nginx
- PM2
- HTTPS with Let's Encrypt

You can also deploy with Docker later, but for a beginner the direct VPS route is easier to understand and debug.

## 1. What You Need Before Starting

You need:
- a domain name
- a VPS server with Ubuntu
- SSH access to that server
- this project on your local machine
- a PostgreSQL database

Recommended beginner setup:
- 1 VPS
- 1 domain
- PostgreSQL on the same server for the first MVP

## 2. Recommended Server Shape

Start with:
- 2 vCPU
- 4 GB RAM
- 60 GB SSD
- Ubuntu 24.04 LTS

That is enough for the current MVP.

## 3. Create The Server

When you buy a VPS, the provider usually asks for:
- server name
- operating system
- region
- SSH key or root password

Choose:
- OS: `Ubuntu 24.04 LTS`
- region: closest to your users
- access: preferably `SSH key`, but password also works for the first setup

## 4. Connect To The Server From Windows

### Option A. Simple password login

Open PowerShell on your computer and run:

```powershell
ssh root@YOUR_SERVER_IP
```

Example:

```powershell
ssh root@203.0.113.10
```

If this is the first connection, type:

```text
yes
```

Then enter the root password from your VPS provider.

### Option B. SSH key login

If you want the safer option:

1. Open PowerShell
2. Create a key:

```powershell
ssh-keygen -t ed25519 -C "nardy-vision"
```

3. Press `Enter` several times
4. The public key is usually here:

```text
C:\Users\YOUR_NAME\.ssh\id_ed25519.pub
```

5. Show it:

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

6. Copy the full line
7. Paste it into your VPS provider's SSH key field
8. Connect:

```powershell
ssh root@YOUR_SERVER_IP
```

## 5. First Basic Server Setup

After login, update packages:

```bash
apt update && apt upgrade -y
```

Install essential tools:

```bash
apt install -y curl git unzip build-essential nginx certbot python3-certbot-nginx
```

## 6. Install Node.js

Use Node 22 because the project is already running on modern Node locally.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Check versions:

```bash
node -v
npm -v
```

## 7. Install PM2

PM2 keeps the app running after reboot.

```bash
npm install -g pm2
```

Check:

```bash
pm2 -v
```

## 8. Install PostgreSQL

For the first MVP you can keep PostgreSQL on the same server.

```bash
apt install -y postgresql postgresql-contrib
```

Enter PostgreSQL:

```bash
sudo -u postgres psql
```

Create database and user:

```sql
CREATE DATABASE nardy_vision;
CREATE USER nardy_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE nardy_vision TO nardy_user;
\q
```

Your connection string will look like:

```text
postgresql://nardy_user:CHANGE_THIS_PASSWORD@127.0.0.1:5432/nardy_vision
```

## 9. Upload The Project To The Server

There are two beginner-friendly ways.

### Option A. Through GitHub

This is the best long-term option.

On your local machine:

1. Create a GitHub repository
2. Push this project there

On the server:

```bash
cd /var/www
git clone YOUR_REPOSITORY_URL nardy-vision
cd /var/www/nardy-vision
```

### Option B. Manual copy

From your local PowerShell:

```powershell
scp -r C:\Users\sivko\Documents\site root@YOUR_SERVER_IP:/var/www/nardy-vision
```

If you use this option, skip `.next`, `node_modules`, and `.env` when possible.

## 10. Create Production Environment File

On the server:

```bash
cd /var/www/nardy-vision
cp .env.example .env
nano .env
```

Put real values:

```env
DATABASE_URL=postgresql://nardy_user:CHANGE_THIS_PASSWORD@127.0.0.1:5432/nardy_vision
NEXTAUTH_SECRET=VERY_LONG_RANDOM_SECRET
NEXTAUTH_URL=https://your-domain.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=/var/www/nardy-vision/.data/storage
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
DEPLOYMENT_VERSION=first-production
```

To generate a random secret on the server:

```bash
openssl rand -base64 32
```

## 11. Install Project Dependencies

Inside the project directory:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate --schema prisma/schema.prisma
```

Push schema to PostgreSQL:

```bash
npm run db:push
```

Optional but recommended for the first smoke test:

```bash
npm run db:seed
```

## 12. Build The App

```bash
npm run build
```

If build succeeds, test locally on the server:

```bash
npm run start:hosted
```

Open another SSH tab and run:

```bash
curl http://127.0.0.1:3000/api/health
```

You should get JSON with `"ok": true`.

If you seeded the database, you can also test login with:

```text
demo@nardyvision.local
Demo12345!
```

Stripe checkout will only start working after you place real values into:

```env
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

Stop the temporary process with:

```bash
Ctrl + C
```

## 13. Run The App Through PM2

From the project directory:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 will print one extra command.
Copy that command and run it.

Then check status:

```bash
pm2 status
pm2 logs nardy-vision
```

## 14. Point Domain To Server

Open your domain provider's DNS panel.

Create records:
- `A` record for `@` -> your server IP
- `A` record for `www` -> your server IP

Wait until DNS updates. This can take from a few minutes to several hours.

## 15. Configure Nginx

Copy the template from this repository:

```bash
cp /var/www/nardy-vision/deploy/nginx/nardy-vision.conf /etc/nginx/sites-available/nardy-vision
```

Edit it:

```bash
nano /etc/nginx/sites-available/nardy-vision
```

Replace:
- `your-domain.com`
- `www.your-domain.com`

Enable the site:

```bash
ln -s /etc/nginx/sites-available/nardy-vision /etc/nginx/sites-enabled/nardy-vision
```

Check config:

```bash
nginx -t
```

If successful, reload:

```bash
systemctl reload nginx
```

Now opening `http://your-domain.com` should show the site.

## 16. Enable HTTPS

Run:

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Choose redirect to HTTPS when asked.

After that, your site should work on:

```text
https://your-domain.com
```

## 17. How To Update The Site Later

When you change code locally and want to deploy:

### If using GitHub

On local machine:

```bash
git add .
git commit -m "Update site"
git push
```

On server:

```bash
cd /var/www/nardy-vision
git pull
npm install
npx prisma generate --schema prisma/schema.prisma
npm run build
pm2 restart nardy-vision
```

### If schema changed

Also run:

```bash
npm run db:push
```

## 18. What Is Still Needed Before Real Production Launch

The site can already be deployed after these steps, but it will still be an MVP.

Before a public launch, you should also add:
- real Prisma-backed dashboard data
- real upload storage
- Stripe checkout and webhook handling
- proper analysis persistence in database
- backup plan for PostgreSQL
- monitoring and error reporting
- legal clarification for any paid workflow built on top of LogasAI tools

## 19. Recommended Execution Order

For this project, the practical order is:

1. Buy domain
2. Buy Ubuntu VPS
3. Connect with SSH
4. Install Node, PostgreSQL, Nginx, PM2
5. Upload project
6. Configure `.env`
7. Run Prisma
8. Build app
9. Start with PM2
10. Point DNS
11. Enable HTTPS
12. Test login, dashboard, analysis page, health endpoint

## 20. Beginner Rule

When something fails, always check these first:

```bash
pm2 logs nardy-vision
nginx -t
systemctl status nginx
curl http://127.0.0.1:3000/api/health
```

These four commands usually tell you where the problem is:
- app process
- reverse proxy
- server service
- app response
