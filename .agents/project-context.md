# Subscrip — Project Context

Subscrip is a SaaS platform for subscription tracking and monthly financial planning. It helps users centralize recurring subscriptions, planned income, planned expenses, payment methods/cards and expected monthly balance.

## Current Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS 4, shadcn-style local UI components, Lucide icons.
- Better Auth with Email OTP.
- Prisma 5 with PostgreSQL.
- next-intl with default English routes and `/pt` prefix for Portuguese.
- Redux Toolkit for client-side finance planner state.

## Main Routes

- `/`: landing page.
- `/auth/login` and `/auth/register`: OTP auth.
- `/dashboard`: protected financial overview.
- `/subscriptions`: subscription CRUD.
- `/subscriptions/[id]`: subscription detail.
- `/finance-planner`: monthly planning.
- `/settings`: user profile and preferences.

## Important Docs

- `docs/v1-readiness-audit.md`: current v1 gap audit.
- `docs/v1-closure-plan.md`: prioritized v1 closure plan.
- `docs/development-roadmap.md`: historical roadmap; verify against code before trusting status.
- `docs/ARCHITECTURE.md`: architecture reference; some proxy/auth details may lag behind code.

## Current V1 Focus

Close the first usable platform version:

1. Keep OTP auth stable.
2. Make subscriptions and finance planner fully usable.
3. Consolidate dashboard with monthly planning.
4. Preserve strict multi-tenant filtering by `userId`.
5. Add minimal quality gates and update documentation.
