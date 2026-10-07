# 0004. Redux seeded from RSC props

- **Status:** accepted
- **Related:** `src/store/`

## Context
Pages are Server Components, but interactive screens need shared client state.

## Decision
Redux Toolkit (slices `auth`, `subscriptions`, `finance`) holds client state. Server data enters via props from RSCs; route-level client wrappers dispatch it. The store does not fetch data directly.

## Alternatives considered
- Client-side fetching into the store: duplicates server loading and weakens SSR.

## Consequences
- Positive: server remains the source of truth.
- Negative: wrappers must keep store and props in sync after revalidation.
