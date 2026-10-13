---
name: subscrip-context
description: Use when working on Subscrip code, planning features, or making architecture decisions. Covers project identity, stack, routes and docs map.
---

# Subscrip — Project Context

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

- `docs/documentation/local-setup.md` — local setup, deploy and manual smoke test
- `prisma/schema.prisma` — data model source of truth
