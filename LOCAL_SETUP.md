# Local Setup Guide For Beginners

This guide helps you run the project on your own Windows computer with PostgreSQL.

If you have never launched a web project before, follow the steps exactly in order.

## 1. What Should Already Be Installed

You need:
- `Node.js 22`
- `npm`
- `PostgreSQL`

To check them, open PowerShell in the project folder and run:

```powershell
node -v
npm -v
psql --version
```

If `psql` is not found, PostgreSQL may still be installed, but its `bin` folder is not in `PATH`.

## 2. Create A Local Database

Open PowerShell and connect to PostgreSQL:

```powershell
psql -U postgres
```

If PostgreSQL asks for a password, enter the password you chose during installation.

Inside `psql`, run:

```sql
CREATE DATABASE nardy_vision;
\q
```

If the database already exists, PostgreSQL will tell you that. That is fine.

## 3. Create The Project Environment File

In the project root:

```powershell
Copy-Item .env.example .env
```

Open `.env` and set these values:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@127.0.0.1:5432/nardy_vision
NEXTAUTH_SECRET=replace-with-a-long-random-string
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=.data/storage
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
DEPLOYMENT_VERSION=local-dev
```

If your PostgreSQL user is not `postgres`, replace it with your real username.

## 4. Generate A Secret

You can create a random secret in PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output into `NEXTAUTH_SECRET`.

## 5. Install Project Dependencies

From the project folder:

```powershell
npm install
```

## 6. Create The Tables And Seed Demo Data

Run:

```powershell
npm run db:setup
```

What this command does:
- generates Prisma Client
- pushes the schema into PostgreSQL
- fills the database with demo data

For local file uploads, the project will also use:
- `STORAGE_DRIVER=local`
- `LOCAL_STORAGE_DIR=.data/storage`

That means uploaded files are stored on your own computer inside the project folder and served back through protected API routes.

After that, the app will already have:
- billing products
- one premium content item
- a `PRO` demo account with purchases, credits, and analyses
- a `FREE` account for comparison

## 7. Demo Login Credentials

After seeding, you can log in with:

```text
demo@nardyvision.local
Demo12345!
```

Or with the free account:

```text
free@nardyvision.local
Free12345!
```

## 8. Start The Project

Run:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 9. What To Check First

Open these pages:
- `/`
- `/pricing`
- `/learn`
- `/register`
- `/login`
- `/analyze`
- `/dashboard`
- `/dashboard/analyses`
- `/dashboard/subscription`

Recommended first test:
1. Log in as `demo@nardyvision.local`
2. Open `/dashboard`
3. Confirm that plan, credits, purchases, and recent analyses are visible
4. Open `/analyze`
5. Upload an image or a `.mat` file and run the mock analysis
6. Go back to `/dashboard/analyses` and check that the new analysis appears in history

## 10. If Something Fails

### Error: `P1000` or `P1001`

Usually means Prisma cannot connect to PostgreSQL.

Check:
- PostgreSQL is running
- `DATABASE_URL` is correct
- username and password are correct
- database `nardy_vision` exists

### Error: `psql` is not recognized

Add PostgreSQL `bin` folder to `PATH`, or use the full path.

Typical path:

```text
C:\Program Files\PostgreSQL\17\bin
```

Then restart PowerShell.

### Error during `npm run db:setup`

Run step by step:

```powershell
npm run prisma:generate
npm run db:push
npm run db:seed
```

This makes it easier to see the exact failing step.

### Site opens, but login does not work

Check:
- `.env` exists
- `NEXTAUTH_SECRET` is set
- `NEXTAUTH_URL=http://localhost:3000`
- database tables were created
- seed finished without error

## 11. How To Reset Demo Data

If you want to refill the demo database, run:

```powershell
npm run db:seed
```

The seed is designed to refresh demo users and their sample records without wiping the whole database.

## 12. What This Gives You Right Now

After local setup, you already have:
- working registration and login
- protected dashboard
- Prisma-backed history and purchases
- seeded billing catalog
- a realistic demo account
- a stable base before storage and Stripe integration

## 13. Stripe Note

The billing flow is already wired in code, but Stripe will only work after you add:

```env
STRIPE_SECRET_KEY=your_real_key
STRIPE_WEBHOOK_SECRET=your_real_webhook_secret
```

Without these values:
- pricing buttons for paid plans will respond with a configuration error
- this is expected
- the rest of the site still works normally
