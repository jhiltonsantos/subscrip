# AGENTS.md — Subscrip

## Project identity

Subscrip is a SaaS subscription-tracking and monthly-finance-planner platform.
Next.js 16 App Router, Better Auth (email OTP), Prisma 5 + PostgreSQL, Redux Toolkit, Tailwind 4 + shadcn/ui, next-intl (en / pt).

Read `.agents/` as the shared source of truth:
- `.agents/project-context.md` — product, stack, routes, docs map
- `.agents/engineering-standards.md` — conventions for every layer
- `.agents/v1-scope.md` — what is blocking vs nice-to-have
- `.agents/agent-playbook.md` — workflow and validation checklist

## Commands

```bash
pnpm dev                   # start dev server (next dev)
pnpm build                 # prisma generate && next build
pnpm lint                  # eslint (flat config: eslint.config.mjs)
pnpm typecheck             # tsc --noEmit --pretty false --incremental false
pnpm test                  # vitest run (jsdom, src/**/*.{test,spec}.{ts,tsx})
pnpm test:watch            # vitest
pnpm check                 # lint + typecheck + test (full gate)
pnpm docker:up             # start PostgreSQL 16 container on :5432
pnpm docker:down           # stop container
pnpm db:setup              # prisma generate + migrate deploy + db seed
pnpm setup                 # docker:up + db:setup
pnpm db:deploy             # prisma generate + migrate deploy (safe for prod)
pnpm db:studio             # Prisma Studio GUI
```

**Guarded destructive commands** — `db:push`, `db:migrate`, `db:reset` run through `prisma/run-guarded-prisma.ts` which blocks execution unless `DATABASE_URL` points to a local host (localhost, 127.0.0.1, docker). Override with `ALLOW_DESTRUCTIVE_DB_OPS=1`. Production migrations use `db:deploy`.

**Targeted validation** (prefer during iteration):
```bash
pnpm exec eslint <files>
pnpm exec tsc --noEmit --pretty false --incremental false
```

## Architecture

### Route groups (App Router)
| Group         | Purpose                    | Auth    |
|---------------|----------------------------|---------|
| `(landing)`   | `/` (public landing)       | none    |
| `(auth)`      | `/auth/login`, `/auth/register` | none |
| `(platform)`  | `/dashboard`, `/subscriptions`, `/finance-planner`, `/settings`, etc. | required |

### Proxy, not middleware

Auth and i18n are handled by `src/proxy.ts` (Node.js runtime), **not** `middleware.ts`:
1. Strips locale prefix from URL (`/pt/dashboard` → `pt` locale)
2. Skips `/api/*` routes
3. Checks Better Auth session cookie via `checkAuth()` — redirects unauthenticated users to `/auth/login`
4. Rewrites locale-prefixed URLs internally with `handleLocaleRewrite()`

The proxy only checks cookie presence. The `(platform)/layout.tsx` server component performs a full `auth.api.getSession()` call with headers for real session validation.

### i18n

- Default locale is English (no URL prefix): `/dashboard`, `/auth/login`
- Portuguese uses `/pt` prefix: `/pt/dashboard`, `/pt/auth/login`
- Use `LocaleLink` (from `@/components/global`) for navigation that preserves locale
- User-facing strings go in `src/translations/client/{en,pt}.json`
- Server-only translations (emails) in `src/translations/server/{en,pt}.json`

### Auth (Better Auth)

- Email OTP only — no password auth
- `src/lib/auth.ts` — server-side `betterAuth` instance with `prismaAdapter`, `emailOTP`, `nextCookies` plugins
- `src/lib/auth-client.ts` — client-side `betterAuth` client
- `src/server/actions/auth/` — server actions for auth operations
- Better Auth MCP server available: `https://mcp.better-auth.com/mcp` (configured in `mcp.json`)

### Server actions

Live under `src/server/actions/<domain>/`. Every action must:
1. **Derive `userId` from session** — never trust client-provided `userId`
2. **Validate input** with Zod before touching the database
3. **Return structured results**: `{ success: true, data }` or `{ success: false, error, fieldErrors? }`
4. **Check ownership** before reading/connecting related rows (payment methods, cards, subscriptions, etc.)
5. **Revalidate** affected routes after successful mutations

### Multi-tenant data

Every user-owned query and mutation filters by `userId` from the authenticated session. `prisma/schema.prisma` is the single source of truth for persisted data.

### Redux store

Three slices: `auth`, `subscriptions`, `finance`. Used for client-side state where server state is bootstrapped from RSCs. Actions are dispatched from route-level client wrappers; server data flows in via props, not directly into Redux.

### UI

- shadcn/ui (New York style, CSS variables, zinc base) — components in `src/components/ui/`
- Never add new UI dependencies before checking existing components
- React Hook Form + Zod for forms
- Mobile-first, dark/light mode via `next-themes`
- Tailwind 4 with `tw-animate-css`, React Compiler enabled

## Setup quickstart

```bash
pnpm install
cp .env.example .env          # defaults work with local Docker
pnpm docker:up                # PostgreSQL 16 on localhost:5432
pnpm db:setup                 # generate + migrate + seed
pnpm dev                      # http://localhost:3000
```
Test user after seed: `test@subscrip.dev`

## Key gotchas

- **`npmrc` hoists**: `.npmrc` sets `node-linker=hoisted` — do not remove
- **Prisma version is pinned**: `5.22.0` (both client and CLI)
- **Build runs `prisma generate` first**: don't skip it when debugging build failures
- **`db:push` is guarded**: don't use it for durable schema changes; use migrations (`db:migrate`) instead
- **Environment**: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` must be set; `RESEND_API_KEY` is optional (falls back to console log in dev)
- **Only one test exists**: `src/components/ui/button.test.tsx` — test coverage is minimal

## References

- `.agents/` — project-context, engineering-standards, v1-scope, agent-playbook
- `.cursor/rules/` — cursor-specific rule files (forward to `.agents/`)
- `.claude/CLAUDE.md` — Claude-specific entrypoint (delegates to `.agents/`)
- `docs/documentation/architecture.md` — architecture reference (some details may lag)
- `docs/documentation/local-setup.md` — local setup instructions
- `docs/roadmap/v1-readiness-audit.md` / `docs/roadmap/v1-closure-plan.md` — current v1 planning baseline
- `docs/roadmap/development-roadmap.md` — historical roadmap with task status

## Docs conventions

When saving generated content to the `docs/` directory, follow these rules:

- **Plans, roadmaps, audits, smoke tests, and task-tracking artifacts** → `docs/roadmap/`
- **Application documentation** (architecture, setup, schema, features, code structure) → `docs/documentation/`
- File names in kebab-case (lowercase, hyphens): `v1-closure-plan.md`, `architecture.md`
- Remove outdated or duplicated files instead of creating variants
