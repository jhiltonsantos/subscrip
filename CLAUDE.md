# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Subscrip is a subscription-tracking and monthly finance-planner SaaS: Next.js 16 App Router, Better Auth (email OTP only), Prisma 5.22 (pinned) + PostgreSQL, Redux Toolkit, Tailwind 4 + shadcn/ui, next-intl (en default, pt). `AGENTS.md` has the fuller project brief (it references a `.agents/` directory that does not exist; the equivalent guidance lives in `.claude/skills/`).

## Git: read-only

Use git only to read (`status`, `diff`, `log`, `show`, `blame`, `branch --list`). Never commit, stage, create/switch branches, merge, rebase, reset, stash, tag or push on your own, even after finishing a task. Only do so if the user explicitly asks in the current conversation. Instead, suggest a commit message and branch name as text. This is also enforced by `permissions.deny` in `.claude/settings.json`.

## Spec-Driven Development

Non-trivial features start with a spec in `docs/specs/NNNN-slug.md`; architectural decisions are recorded as ADRs in `docs/decisions/NNNN-slug.md` (accepted ADRs are superseded, not edited). Use `/spec <title>` and `/adr <title>` (subagents `spec-writer`, `adr-writer`); see skill `subscrip-sdd`. Other subagents: `security-reviewer` (multi-tenant review of server actions) and `quality-gate` (lint/typecheck/test). Project skills and commands (`/check`, `/validate`, `/inspect`) live in `.claude/`, mirrored from `.opencode/` which is kept for opencode users.

## Commands

```bash
pnpm dev                 # next dev (http://localhost:3000)
pnpm check               # lint + typecheck + test (the full gate; CI runs lint, test, typecheck)
pnpm lint                # eslint (flat config)
pnpm typecheck           # tsc --noEmit
pnpm test                # vitest run (jsdom, src/**/*.{test,spec}.{ts,tsx})
pnpm exec vitest run src/lib/subscription-billing.test.ts   # single test file
pnpm exec vitest run -t "name"                              # single test by name
pnpm exec eslint <files>                                    # targeted lint

pnpm setup               # docker:up (Postgres 16 on :5432) + db:setup (generate, migrate deploy, seed)
pnpm db:migrate          # prisma migrate dev, guarded (see below)
pnpm db:deploy           # generate + migrate deploy (production-safe)
```

Setup: `cp .env.example .env`, then fill `DATABASE_URL` (docker-compose credentials are `subscrip:subscrip_dev/subscrip` on localhost:5432). `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are required; `RESEND_API_KEY` is optional (OTP emails fall back to console log in dev). Seed user: `test@subscrip.dev`.

`db:push`, `db:migrate`, `db:reset` go through `prisma/run-guarded-prisma.ts`, which refuses non-local `DATABASE_URL` unless `ALLOW_DESTRUCTIVE_DB_OPS=1`. Use migrations, not `db:push`, for schema changes. `schema.prisma` also needs `DIRECT_URL` (non-pooled) for migrations.

## Architecture

**Proxy, not middleware.** `src/proxy.ts` (delegating to `src/lib/proxy/{auth,i18n}.ts`) strips the `/pt` locale prefix, skips `/api/*`, redirects cookie-less requests to `/auth/login`, and internally rewrites locale-prefixed URLs. It only checks session-cookie *presence* (Better Auth cookie cache is 5 min); real validation happens in `src/app/(platform)/layout.tsx` via `auth.api.getSession({ headers })`.

**Route groups** under `src/app`: `(landing)`, `(auth)`, `(platform)` (dashboard, subscriptions, finance-planner, card-invoice, payment-methods, reports, settings, plan). Auth is served by `api/auth/[...all]`.

**i18n.** English has no URL prefix; Portuguese uses `/pt`. Navigate with `LocaleLink` / `localizedRedirect` (`src/lib/i18n`), not raw `next/link` / `redirect`. Strings live in `src/translations/client/{en,pt}.json` (UI) and `src/translations/server/{en,pt}.json` (emails); keep both languages in sync.

**Server actions** (`src/server/actions/<domain>/`, domains: auth, user, subscriptions, finance-planner, payment-methods) are the data layer; there is no REST API. Each domain has a `shared.ts` with helpers (`getUserIdOrNull`, `formatZodError`, result types, Prisma `include` shapes) and an `index.ts` barrel. Conventions every action follows:
- derive `userId` from the session, never from client input; every query filters by it
- validate with the Zod schema from `src/lib/validations/` before touching the DB
- check ownership of related rows (payment methods, cards, subscriptions) before connecting them
- return `{ success: true, data }` or `{ success: false, error, fieldErrors? }`
- `revalidatePath` affected routes after mutations

**Data flow.** Pages are RSCs that fetch via server actions and pass data as props to route-level client wrappers, which dispatch into Redux (`src/store/features/{auth,subscriptions,finance}` + `src/store/selectors`). Redux is client-side state seeded from server data; it does not fetch directly.

**Domain model** (`prisma/schema.prisma`): `Subscription` and the finance planner are linked. `MonthlyPlan` owns `PlannedIncome` and `PlannedExpense`; expenses can reference a `Subscription`, `PaymentMethod`/`PaymentCard`, `CreditCardInvoice`, or `InstallmentPurchase`. `src/components/subscription-expense-sync` and `actions/subscriptions/expense-sync.ts` keep subscription billing and planned expenses in step; billing-date math is in `src/lib/subscription-billing.ts`.

**UI.** shadcn/ui (New York, zinc) in `src/components/ui/`; check existing components before adding dependencies. Forms use React Hook Form + Zod. React Compiler is enabled (`reactCompiler: true`), so avoid manual memoization.

## Gotchas

- `.npmrc` sets `node-linker=hoisted`; do not remove.
- `next.config.ts` is wrapped by `withNextIntl`; removing it breaks i18n routing.
- `pnpm build` runs `prisma generate` first; do the same when debugging build failures.
- Prisma seed/guard scripts run via ts-node with CommonJS (`prisma/tsconfig.json`); ESM-only imports fail there.
- ESLint forbids `any` and unused vars in `src/` (prefix intentionally unused with `_`).
- Tests are colocated (`*.test.ts` next to source) and cover validations, Redux slices/selectors, formatters, and billing/chart helpers; shared render helpers are in `src/test-utils`.

## Docs

Specs live in `docs/specs/`, ADRs in `docs/decisions/`, and application documentation in `docs/documentation/` (currently `local-setup.md`). There is no roadmap: scope and status live in specs, decisions in ADRs. Use kebab-case filenames and delete outdated files rather than creating variants.
