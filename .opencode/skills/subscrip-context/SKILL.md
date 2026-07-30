---
name: subscrip-context
description: Use when working on Subscrip code, planning features, or making architecture decisions. Covers project identity, stack, routes, docs map, v1 scope, and priority classification.
---

# Subscrip — Project Context & V1 Scope

Subscrip is a SaaS subscription-tracking and monthly-finance-planner platform.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (New York style, zinc base), Lucide icons
- Better Auth (email OTP only — no password auth)
- Prisma 5 + PostgreSQL
- next-intl (en / pt — default English, Portuguese at `/pt` prefix)
- Redux Toolkit (3 slices: auth, subscriptions, finance)
- React Hook Form + Zod for forms
- next-themes (dark/light), GSAP animations, Recharts

## Main Routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing page | none |
| `/auth/login`, `/auth/register` | OTP auth | none |
| `/dashboard` | Financial overview | required |
| `/subscriptions` | Subscription CRUD | required |
| `/subscriptions/[id]` | Subscription detail | required |
| `/finance-planner` | Monthly planning | required |
| `/settings` | User profile/preferences | required |

## Architecture

- **Proxy, not middleware**: `src/proxy.ts` handles auth cookies and i18n rewrites (Node.js runtime). The `(platform)/layout.tsx` server component performs a full `auth.api.getSession()` call for real session validation.
- **Server actions**: Live under `src/server/actions/<domain>/` (auth, user, subscriptions, finance-planner, payment-methods). Always derive `userId` from session, validate with Zod, return structured results.
- **Multi-tenant**: Every user-owned query/mutation filters by session `userId`. `prisma/schema.prisma` is the source of truth.

## Key Docs

- `docs/roadmap/v1-readiness-audit.md` — current v1 gap audit
- `docs/roadmap/v1-closure-plan.md` — prioritized v1 closure plan
- `docs/roadmap/development-roadmap.md` — historical roadmap (verify against code)
- `docs/documentation/architecture.md` — architecture reference (some details may lag)

## V1 Scope Classification

When asked to implement something, classify it first:

### V1 Blocking (keep solutions robust and complete)
- OTP login/register/logout without redirect loops
- Local setup with PostgreSQL, migrations, seed documented
- Dashboard with user-scoped subscription and monthly planning data
- Subscription CRUD: create, edit, list, detail, deactivate/delete
- Monthly finance planner: create, edit, delete incomes and expenses; monthly summary
- Settings for name and basic preferences
- All user-owned queries/mutations scoped by session `userId`
- Lint/typecheck/smoke validation documented

### V1 Important
- Subscription search/filter/sort
- i18n cleanup for all platform strings
- Reminder preferences and email reminder path
- Dashboard cards: income, expenses, subscriptions, total outflow, balance
- Updated docs matching current code

### V1.1 (confirm priority before expanding)
- Email reminder scheduler with Resend and Vercel Cron
- Real currency conversion with cache
- Charts and analytics
- Account management: email change, avatar, delete account
- Playwright E2E suite and CI

### Post-v1 (do not build before core flows are reliable)
- Browser push notifications
- Advanced GSAP animations
- Multi-session/device management
- Full observability
