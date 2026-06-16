# Subscrip — Engineering Standards

## General

- Prefer existing local patterns over introducing new abstractions.
- Keep edits scoped to the requested feature or fix.
- Do not commit secrets or local `.env` values.
- Treat `prisma/schema.prisma` as the source of truth for persisted data.

## Next.js App Router

- Put routes and route-level loading/error concerns in `src/app`.
- Keep data fetching and session checks in Server Components when possible.
- Use Client Components only for browser interactivity, local state, forms and animations.
- Protected platform pages live under `src/app/(platform)`.

## Server Actions

- Server actions live under `src/server/actions/<domain>`.
- Always validate inputs with Zod before writing.
- Always derive `userId` from the authenticated session on the server.
- Never trust user-provided `userId`.
- Return explicit result objects: `{ success: true, data }` or `{ success: false, error, fieldErrors? }`.
- Revalidate affected routes after successful mutations.

## Prisma and Multi-Tenant Data

- Every user-owned read/write must filter by session `userId`.
- Check ownership before connecting related rows such as payment methods, cards, invoices, subscriptions or installments.
- Use migrations for schema history; avoid relying on `db:push` for durable changes.
- Keep seed scripts clearly marked as local/dev if they delete data.

## UI and Forms

- Use existing components in `src/components/ui` before adding dependencies.
- Use React Hook Form + Zod for non-trivial forms.
- Keep UI mobile-first and accessible.
- Preserve dark/light mode classes.
- Use translations from `src/translations/client` for user-visible copy.

## i18n

- Default locale is English without URL prefix.
- Portuguese uses `/pt` URL prefix.
- Use `LocaleLink` for navigation that should preserve locale.
- Avoid hardcoded user-facing strings in platform UI.
