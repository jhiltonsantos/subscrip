# Architecture Decision Records

Decisions that are costly to reverse. Flow and rules: skill `subscrip-sdd`. Use `/adr <title>` or the `adr-writer` subagent.

- Numbers are sequential 4 digits, never reused; file names kebab-case.
- Accepted ADRs are not rewritten. To change a decision, add a new ADR and mark the old one `superseded by NNNN`.
- Template: `0000-template.md`.

| # | Title | Status |
|---|---|---|
| [0001](0001-proxy-instead-of-middleware.md) | Proxy instead of middleware for auth and i18n | accepted |
| [0002](0002-email-otp-only-auth.md) | Better Auth with email OTP only | accepted |
| [0003](0003-server-actions-data-layer.md) | Server actions as the data layer, userId from session | accepted |
| [0004](0004-redux-seeded-from-rsc-props.md) | Redux seeded from RSC props | accepted |
