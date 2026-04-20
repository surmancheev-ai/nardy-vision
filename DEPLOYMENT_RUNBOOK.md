# VPS Deployment Runbook

This runbook is the practical, step-by-step path for putting Nardy Vision onto a real VPS.

It is written for a beginner on Windows who has never deployed a site before.

The goal is simple:
- buy a VPS
- connect to it safely
- install everything the app needs
- upload the project
- start the app
- connect the domain
- enable HTTPS
- verify that the whole site actually works

This document is intentionally repetitive in a few places. That is a feature, not a bug. When you are new to deployment, repetition lowers the chance of a hidden mistake.

## 0. What You Need Before Starting

You need:
- a domain name
- a VPS with `Ubuntu 24.04 LTS`
- SSH access to the VPS
- this project on your local computer
- PostgreSQL password that you can control

Recommended first server:
- `2 vCPU`
- `4 GB RAM`
- `60 GB SSD`

That is enough for the current MVP.

## 1. What You Will Do In Real Order

Follow this exact order:

1. Buy the VPS
2. Buy or choose the domain
3. Connect to the server from Windows
4. Create a normal deploy user on the server
5. Install Node.js, PostgreSQL, Nginx, PM2
6. Create database and database user
7. Upload the project to the server
8. Create `.env`
9. Run Prisma and seed data
10. Build the app
11. Start the app with PM2
12. Point the domain to the server IP
13. Configure Nginx
14. Enable HTTPS
15. Run the smoke test checklist

## 2. Buy The VPS

When the VPS provider asks for setup values, choose:
- OS: `Ubuntu 24.04 LTS`
- Region: closest to your future users
- Access: `SSH key` if possible, password if you need a simpler first start

The provider will give you:
- the server IP
- root login or SSH key access

Write these down in a safe place:
- `SERVER_IP`
- `ROOT_PASSWORD` if using password login

## 3. Connect To The Server From Windows

### Option A. Password login

Open PowerShell:

```powershell
ssh root@YOUR_SERVER_IP
```

Example:

```powershell
ssh root@203.0.113.10
```

If you see:

```text
Are you sure you want to continue connecting
```

Type:

```text
yes
```

Then enter the root password.

### Option B. SSH key login

If you do not already have a key:

```powershell
ssh-keygen -t ed25519 -C "nardy-vision"
```

Then show the public key:

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Copy that full line into your VPS provider's SSH key field.

Then connect:

```powershell
ssh root@YOUR_SERVER_IP
```

## 4. First Commands On The Server

After you log in:

```bash
apt update
apt upgrade -y
apt install -y curl git unzip build-essential nginx certbot python3-certbot-nginx ufw
```

These commands:
- refresh server packages
- install Nginx
- install HTTPS tools
- install firewall tools

If you want the repository's helper script instead of typing everything manually:

```bash
bash deploy/server/bootstrap-ubuntu.sh
```

Use that only after the project is already on the server.

## 5. Create A Normal Deploy User

Do not run the whole project forever as `root`.

Create a normal user:

```bash
adduser deploy
usermod -aG sudo deploy
```

If you are using SSH keys, copy root's authorized keys:

```bash
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Or use the helper script from this repository:

```bash
bash deploy/server/create-deploy-user.sh
```

Now test login in a **new PowerShell window**:

```powershell
ssh deploy@YOUR_SERVER_IP
```

If that works, continue as `deploy`.

## 6. Optional But Recommended: Basic Firewall

Still on the server:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Expected result:
- SSH is allowed
- HTTP and HTTPS are allowed

## 7. Install Node.js

Use Node 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

You should see versions printed in the terminal.

## 8. Install PM2

PM2 keeps the app alive after reboot:

```bash
sudo npm install -g pm2
pm2 -v
```

## 9. Install PostgreSQL

On the server:

```bash
sudo apt install -y postgresql postgresql-contrib
```

Open PostgreSQL shell:

```bash
sudo -u postgres psql
```

Inside PostgreSQL:

```sql
CREATE DATABASE nardy_vision;
CREATE USER nardy_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE nardy_vision TO nardy_user;
\q
```

Your production `DATABASE_URL` will be:

```text
postgresql://nardy_user:CHANGE_THIS_PASSWORD@127.0.0.1:5432/nardy_vision
```

Keep that exact password somewhere safe.

## 10. Upload The Project

Recommended method: GitHub.

### On your local computer

Push the project to GitHub.

### On the server

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone YOUR_REPOSITORY_URL nardy-vision
cd /var/www/nardy-vision
```

Alternative for first-time manual upload from Windows:

```powershell
scp -r C:\Users\sivko\Documents\site deploy@YOUR_SERVER_IP:/var/www/nardy-vision
```

GitHub is still better for ongoing updates.

## 11. Create `.env` On The Server

Inside the project folder:

```bash
cd /var/www/nardy-vision
cp .env.example .env
nano .env
```

Put values like this:

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

Generate a random secret:

```bash
openssl rand -base64 32
```

Paste it into `NEXTAUTH_SECRET`.

## 12. Install Dependencies And Prepare The Database

Inside the project folder:

```bash
npm install
npx prisma generate --schema prisma/schema.prisma
npm run db:push
npm run db:seed
```

What this does:
- installs packages
- generates Prisma Client
- creates tables in PostgreSQL
- seeds demo users and demo data

## 13. Build The Application

```bash
npm run build
```

If build succeeds, start a temporary test run:

```bash
npm run start:hosted
```

Open a second SSH session and check:

```bash
curl http://127.0.0.1:3000/api/health
```

Expected result:
- JSON response
- `"ok": true`

If that works, stop the temporary process with `Ctrl + C`.

## 14. Start The App With PM2

```bash
cd /var/www/nardy-vision
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 will print one extra command.

Copy that command and run it.

Then check:

```bash
pm2 status
pm2 logs nardy-vision
```

Expected result:
- app is online
- no crash loop

For later updates, you can use the repository helper:

```bash
bash deploy/server/deploy-update.sh
```

## 15. Point The Domain To The VPS

Open your domain registrar panel and add:

- `A` record for `@` -> your server IP
- `A` record for `www` -> your server IP

Wait for DNS propagation.

You can verify from Windows:

```powershell
nslookup your-domain.com
```

It should return the VPS IP.

## 16. Configure Nginx

Copy the included template:

```bash
sudo cp /var/www/nardy-vision/deploy/nginx/nardy-vision.conf /etc/nginx/sites-available/nardy-vision
sudo nano /etc/nginx/sites-available/nardy-vision
```

Replace:
- `your-domain.com`
- `www.your-domain.com`

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/nardy-vision /etc/nginx/sites-enabled/nardy-vision
sudo nginx -t
sudo systemctl reload nginx
```

Expected result:
- `nginx -t` says configuration is OK
- opening `http://your-domain.com` shows the site

## 17. Enable HTTPS

Run:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Choose redirect to HTTPS.

Then test:

```text
https://your-domain.com
```

## 18. Smoke Test Checklist

After HTTPS works, test these pages:

1. `/`
2. `/pricing`
3. `/learn`
4. `/register`
5. `/login`
6. `/analyze`
7. `/dashboard`
8. `/dashboard/subscription`
9. `/api/health`

If you seeded data, log in with:

```text
demo@nardyvision.local
Demo12345!
```

Then verify:
- login works
- dashboard opens
- history is visible
- upload analysis works
- subscription page opens

If you want a quick automated check from the server itself:

```bash
bash deploy/server/smoke-test.sh
```

After the domain is live, you can also run:

```bash
bash deploy/server/smoke-test.sh https://your-domain.com
```

## 19. Production Stripe Note

Stripe should be connected only after the base deployment works.

When you are ready:
- add `STRIPE_SECRET_KEY`
- add `STRIPE_WEBHOOK_SECRET`
- create a production webhook in Stripe pointing to:

```text
https://your-domain.com/api/billing/webhook
```

Then restart the app:

```bash
pm2 restart nardy-vision
```

## 20. How To Update The Site Later

On your local computer:

```bash
git add .
git commit -m "Update site"
git push
```

On the server:

```bash
cd /var/www/nardy-vision
git pull
npm install
npx prisma generate --schema prisma/schema.prisma
npm run build
pm2 restart nardy-vision
```

If the Prisma schema changed:

```bash
npm run db:push
```

## 21. Fast Failure Checklist

If something does not work, check these first:

```bash
pm2 logs nardy-vision
pm2 status
sudo nginx -t
sudo systemctl status nginx
curl http://127.0.0.1:3000/api/health
```

These commands tell you:
- whether the app is running
- whether Nginx is valid
- whether the app itself responds

## 22. What You Should Send Me When You Are Ready

When you actually buy the VPS and want to move from preparation to real deployment, send me:

1. the VPS provider name
2. whether you have root password or SSH key access
3. the domain name you want to use
4. whether the code is already in GitHub

Then I can guide you through the live deployment one command at a time.
