# Nardy Vision MVP

Nardy Vision is an MVP foundation for a SaaS platform focused on long nardy analysis.

The core product is not content. The core product is the analytical layer around:
- position recognition from an uploaded board image
- structured analysis output
- future integration with real analysis engines
- a monetization model that supports both subscriptions and one-time paid compute

This repository currently contains the web platform shell, mock-backed analysis flows, authentication, dashboard, pricing model, and the backend abstractions needed to evolve the MVP into a commercial product.

## Product Scope

The MVP includes:
- public marketing pages
- registration and login
- authenticated dashboard
- image-based position analysis UI
- mock API for analysis results
- billing-ready architecture for subscriptions and one-time purchases
- preparation for desktop-backed match protocol analysis

The product model already accounts for:
- `Free`, `Pro`, `Premium`
- one-time position packs
- one-time paid learning materials
- separate paid compute credits for heavy match analysis

## Tech Stack

- `Next.js` App Router
- `React`
- `TypeScript`
- `Tailwind CSS v4`
- `Prisma ORM`
- `PostgreSQL`
- `Auth.js / NextAuth`
- `Stripe` scaffolding
- `Zod`

## Architecture

The codebase is structured as a modular monolith.

Main layers:
- `src/app`
  Route handlers, pages, layouts
- `src/components`
  Reusable UI building blocks
- `src/features`
  Feature-local client/server logic and validators
- `src/server/use-cases`
  Application scenarios and orchestration
- `src/server/services`
  External-facing integrations and adapters
- `src/server/repositories`
  Persistence abstractions
- `src/types`
  Shared type contracts
- `prisma/schema.prisma`
  Data model

Design principles:
- business logic is kept out of UI
- analysis flows are abstracted behind service contracts
- billing and entitlements are modeled separately from presentation
- mock implementations can be replaced without rewriting the interface

## Current Functional Areas

### Public pages

Implemented routes:
- `/`
- `/about`
- `/pricing`
- `/learn`

They present the platform as an analysis-first SaaS, not a content-only learning site.

### Authentication

Implemented:
- credentials-based registration
- login
- session handling
- protected dashboard routes

Registration currently creates:
- a `User`
- a default `FREE` subscription

Relevant files:
- [src/auth.ts](./src/auth.ts)
- [src/features/auth/actions.ts](./src/features/auth/actions.ts)
- [src/server/use-cases/auth/register-user.ts](./src/server/use-cases/auth/register-user.ts)

### Analysis

Implemented:
- upload flow for board images
- mock API-backed analysis result
- typed result rendering
- separate analysis modes:
  - `POSITION_IMAGE`
  - `MATCH_PROTOCOL`

Relevant files:
- [src/app/analyze/page.tsx](./src/app/analyze/page.tsx)
- [src/components/analysis/analysis-workbench.tsx](./src/components/analysis/analysis-workbench.tsx)
- [src/app/api/analyses/route.ts](./src/app/api/analyses/route.ts)
- [src/server/services/analysis/mock-analysis-service.ts](./src/server/services/analysis/mock-analysis-service.ts)

### Dashboard

Implemented:
- overview
- analysis history
- profile
- subscription and purchase visibility

The dashboard is now backed by Prisma queries for:
- subscription state
- recent analyses
- one-time purchases
- credit balances

Relevant files:
- [src/server/use-cases/dashboard/get-dashboard-snapshot.ts](./src/server/use-cases/dashboard/get-dashboard-snapshot.ts)
- [src/app/(dashboard)/dashboard/page.tsx](./src/app/(dashboard)/dashboard/page.tsx)

## Database Model

Core entities already modeled in Prisma:
- `User`
- `Subscription`
- `Analysis`
- `UploadedImage`
- `Content`
- `BillingProduct`
- `BillingPrice`
- `Purchase`
- `PurchaseItem`
- `ContentAccessGrant`
- `AnalysisCreditLedger`
- auth tables: `Account`, `Session`, `VerificationToken`

This model supports:
- recurring subscriptions
- one-time purchases
- content access grants
- credit-based analysis
- future separation between cheap and expensive analysis types

## Billing Model

The architecture intentionally supports mixed monetization:

### Recurring subscription
- `FREE`
- `PRO`
- `PREMIUM`

### One-time purchases
- packs of position analyses
- single premium content items
- future paid match protocol compute jobs

This is important because the platform is not only a classic subscription SaaS. Some analysis flows are expensive enough to justify pay-per-use.

## LogasAI Block

The repository now also contains local installations of:
- `LogasAI Game`
- `LogasAI Analysis`

These are relevant because they introduce a second strong product direction:

### Flow

1. `LogasAI Game` can generate completed match protocols in `MAT`
2. `LogasAI Analysis` can analyze those saved matches
3. the web platform can eventually accept uploaded match protocols
4. a desktop-backed worker can run the heavy analysis locally
5. the result can be normalized into a SaaS-style report

### Why this matters

This creates a distinct product module:
- `image position analysis`
- `match protocol analysis`

The second one is compute-heavy and should be billed separately.

### Recommended product treatment

Treat match analysis as its own commercial flow:
- upload `MAT`, `7Z`, or `LMA`
- estimate cost before execution
- consume compute credits
- queue the job
- run a local worker
- parse and return a structured report

### Important legal note

The local license files for `LogasAI Game` and `LogasAI Analysis` say the software is free for personal use.

That is not the same as permission to build a paid SaaS workflow on top of it.

Before monetizing any feature powered by these programs, you should obtain explicit permission or a commercial agreement from the author.

This is a product and legal constraint, not a technical one.

## Environment Variables

At minimum, define:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nardy_vision
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=.data/storage
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Notes:
- `DATABASE_URL` is required for Prisma runtime operations
- `NEXTAUTH_SECRET` is required for Auth.js
- local storage is now wired for uploaded files through a storage service abstraction
- Stripe and S3-compatible storage are scaffolded but not fully wired yet

## Local Development

For a beginner-friendly local walkthrough, use:

- [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Push or migrate schema:

```bash
npm run db:push
```

Seed demo data:

```bash
npm run db:seed
```

Or run the full local setup in one command:

```bash
npm run db:setup
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Current Status

Implemented:
- public product pages
- authentication
- protected dashboard shell
- dashboard views
- mock analysis API
- image analysis UI
- local storage-backed upload persistence for signed-in users
- billing-ready database model
- match protocol direction in UI and domain modeling

Still mock or scaffolded:
- actual file storage
- Stripe checkout depends on real `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- real image recognition backend
- real match protocol analysis worker
- real job queue and async processing

## Demo Accounts

After `npm run db:setup`, you can log in with:

```text
demo@nardyvision.local / Demo12345!
free@nardyvision.local / Free12345!
```

## Suggested Next Evolution

Logical next milestones after this MVP foundation:
- connect uploads to storage and `UploadedImage`
- persist `Analysis` rows from `/api/analyses`
- implement Stripe checkout and credit purchases
- add queue-based execution for match protocol analysis
- design a parser/adapter around desktop-backed `LogasAI Analysis`

## Verification

The current project has been verified with:

```bash
npm run lint
npm run build
```

Both commands pass on the current state of the repository.
