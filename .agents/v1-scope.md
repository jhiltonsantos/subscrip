# Subscrip — V1 Scope

## V1 Blocking

- OTP login/register/logout without redirect loops.
- Local setup with PostgreSQL, migrations and seed documented.
- Dashboard with user-scoped subscription and monthly planning data.
- Subscription CRUD: create, edit, list, detail, deactivate/delete.
- Monthly finance planner: create, edit, delete incomes and expenses; monthly summary.
- Minimal payment method/card management if planner depends on card data.
- Settings for name and basic preferences.
- All user-owned queries and mutations scoped by session `userId`.
- Lint/typecheck/smoke validation documented.

## V1 Important

- Subscription search/filter/sort.
- i18n cleanup for all platform strings.
- Reminder preferences and at least a clear path toward email reminders.
- Dashboard cards for income, expenses, subscriptions, total outflow and balance.
- Updated docs that match current code.

## V1.1

- Email reminder scheduler with Resend and Vercel Cron.
- Real currency conversion with cache.
- Charts and analytics.
- Better account management: email change, avatar, delete account.
- Playwright E2E suite and CI.

## Post-v1

- Browser push notifications.
- Advanced GSAP animations.
- Multi-session/device management.
- Full observability and custom production domain.

## Scope Rule for Agents

When asked to implement something, classify it first:

- If it is V1 blocking, keep the solution robust and complete.
- If it is V1.1 or post-v1, confirm priority before expanding scope.
- Avoid building advanced polish before core flows are reliable.
