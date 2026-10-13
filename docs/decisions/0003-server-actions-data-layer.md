# 0003. Server actions as the data layer, userId from session

- **Status:** accepted
- **Related:** `src/server/actions/`, `src/lib/validations/`

## Context
All data is user-owned and multi-tenant; the client must never be able to choose whose data it touches.

## Decision
Data access lives in server actions under `src/server/actions/<domain>/` (no REST layer). Each action derives `userId` from the session, validates input with Zod, checks ownership of related rows, returns `{ success, data }` or `{ success: false, error, fieldErrors? }`, and revalidates affected routes.

## Alternatives considered
- REST/route handlers: extra surface and duplicated validation for an app-internal API.

## Consequences
- Positive: one consistent security checklist, enforced by review (`security-reviewer`).
- Negative: the rules are by convention; a missed `userId` filter is a data leak.
