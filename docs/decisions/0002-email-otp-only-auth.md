# 0002. Better Auth with email OTP only

- **Status:** accepted
- **Related:** `src/lib/auth.ts`, `src/lib/auth-client.ts`

## Context
The product needs low-friction sign-in without managing passwords.

## Decision
Use Better Auth with the `emailOTP` plugin and the Prisma adapter. No password authentication. OTP emails go through Resend; without `RESEND_API_KEY` the code is logged to the console in development.

## Alternatives considered
- Email + password: more attack surface and reset flows.
- Social login only: excludes users without those accounts.

## Consequences
- Positive: no password storage or reset flow.
- Negative: login depends on email delivery.
