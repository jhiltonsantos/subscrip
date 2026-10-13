# 0001. Proxy instead of middleware for auth and i18n

- **Status:** accepted
- **Related:** `src/proxy.ts`, `src/lib/proxy/`

## Context
Auth gating and locale handling (English unprefixed, Portuguese under `/pt`) must run before routing, on the Node.js runtime.

## Decision
Use `src/proxy.ts` (Next.js 16 proxy, Node.js runtime) instead of `middleware.ts`. It strips the locale prefix, skips `/api/*`, redirects cookie-less requests to `/auth/login`, and rewrites locale-prefixed URLs. It only checks session-cookie presence; `(platform)/layout.tsx` does full validation with `auth.api.getSession`.

## Alternatives considered
- `middleware.ts`: superseded by the proxy convention in Next.js 16.
- Full session validation in the proxy: too costly per request.

## Consequences
- Positive: cheap gating, locale logic in one place.
- Negative: Better Auth's 5-minute cookie cache can make proxy auth state lag; real protection depends on the layout check.
