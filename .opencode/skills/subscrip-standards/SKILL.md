---
name: subscrip-standards
description: Use when writing or reviewing Subscrip code — especially when editing src/server/actions, prisma/schema, src/app routes, src/components, or src/store. Covers coding conventions, server actions patterns, multi-tenant data rules, UI conventions, and i18n.
---

# Subscrip — Engineering Standards

## General

- Prefer existing local patterns over introducing new abstractions
- Keep edits scoped to the requested feature or fix
- Do not commit secrets or local `.env` values
- Treat `prisma/schema.prisma` as the source of truth for persisted data

## Next.js App Router

- Route files in `src/app` stay focused on routing, layout, and data loading
- Use Server Components for session checks and data reads
- Use Client Components only for browser interactivity, local state, forms, and animations
- Protected platform pages live under `src/app/(platform)`

## Server Actions (`src/server/actions/<domain>/`)

Every server action must:
1. **Derive `userId` from session** — never trust client-provided `userId`
2. **Validate input** with Zod before touching the database
3. **Return structured results**: `{ success: true, data }` or `{ success: false, error, fieldErrors? }`
4. **Check ownership** before reading/connecting related rows (payment methods, cards, subscriptions, installments)
5. **Revalidate** affected routes after successful mutations

## Prisma and Multi-Tenant Data

- Every user-owned read/write must filter by session `userId`
- Check ownership before connecting related records
- Use migrations for schema history; avoid relying on `db:push` for durable changes
- Keep seed scripts clearly local/dev if they delete data
- `prisma/tsconfig.json` uses CommonJS — ESM-only imports will fail in seed/guard scripts

## UI and Forms

- Use existing components in `src/components/ui/` before adding dependencies
- Use React Hook Form + Zod for non-trivial forms
- Mobile-first, accessible, dark/light mode compatible
- Use translations from `src/translations/client/` for user-visible copy — never hardcode strings in platform UI

## i18n

- Default locale is English without URL prefix: `/dashboard`, `/auth/login`
- Portuguese uses `/pt` prefix: `/pt/dashboard`, `/pt/auth/login`
- Use `LocaleLink` (from `@/components/global`) for navigation that preserves locale
- User-facing strings: `src/translations/client/{en,pt}.json`
- Server-only translations (emails): `src/translations/server/{en,pt}.json`
- `next.config.ts` is wrapped by `withNextIntl` — removing the plugin breaks i18n routing

## Redux Store

- Three slices: `auth`, `subscriptions`, `finance` (in `src/store/features/`)
- Server data flows in via RSC props, not directly into Redux
- Actions dispatched from route-level client wrappers
