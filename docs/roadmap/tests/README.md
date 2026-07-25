# Test Infrastructure Roadmap

> **Last updated:** 2026-07-24
> **Status:** Phases 1–3 complete, progressing through Phase 4

## Decisions

| Decision | Choice |
|---|---|
| Mock strategy | Globals in `vitest.setup.ts` (not per-test imports) |
| Coverage config | Deferred |
| Server action tests | Include with mocked Prisma (Phase 5) |
| Execution order | Phase 1 → 2 → 3 → 4 → 5 |

---

## Phase 1 — Foundation (test-utils + global mocks)

- [x] 1.1 Add `@testing-library/user-event` to devDependencies
- [x] 1.2 Create `src/test-utils/render.tsx` — custom render with full provider tree:
  - `ReduxProvider` (fresh `configureStore` per test, `preloadedState` support)
  - `ThemeProvider` (next-themes, `light`, `enableSystem=false`)
  - `NextIntlClientProvider` (next-intl, configurable `locale` + `messages`)
  - Returns `{ ...render(ui), store, user }`
- [x] 1.3 Create `src/test-utils/index.ts` — barrel export
- [x] 1.4 Create global mocks in `vitest.setup.ts`:

| Module | Default behaviour |
|---|---|
| `@/server/actions/auth` | `getSession → null`, `signOut → vi.fn()` |
| `@/server/actions/subscriptions` | All return `{ success: true, data: [...] }` |
| `@/server/actions/finance-planner` | All return `{ success: true, data: ... }` |
| `@/server/actions/payment-methods` | All return `{ success: true, data: ... }` |
| `@/server/actions/user` | `getUser → { success: false, error: "Unauthorized" }` |
| `next/navigation` | `useRouter`, `usePathname`, `useSearchParams`, `useParams`, `redirect` |

- [x] 1.5 Validate: `typecheck` + `test` passing

---

## Phase 2 — Pure function tests

> Zero provider/mock dependencies. Tests colocated next to source files.

### 2.1 Utilities

- [x] `src/lib/utils/helpers.test.ts` — `cn()`
- [x] `src/lib/utils/formatters.test.ts` — `formatCurrency()`

### 2.2 Billing logic

- [x] `src/lib/subscription-billing.test.ts` — 9 functions:
  - `buildChargeDate`, `resolveMonthlyChargeDate`, `resolveYearlyChargeDate`
  - `resolveInvoiceMonth`, `resolveChargeForInvoiceMonth`
  - `isChargeAwaiting`, `resolveNextChargeDate`
  - `formatBillingSummary`, `isSameOrAfterMonth`

### 2.3 Labels and constants

- [x] `src/lib/subscription-labels.test.ts` — `getCategoryLabel`, `getBillingCycleLabel`, `formatSubscriptionDueDate`
- [x] `src/lib/subscription-constants.test.ts` — constant integrity checks

### 2.4 Zod validations

- [x] `src/lib/validations/user-settings.test.ts` — `userSettingsSchema`, `darkThemeVariantSchema`
- [x] `src/lib/validations/payment-methods.test.ts` — `paymentMethodCreateSchema` (+ `superRefine`), `paymentMethodUpdateSchema`
- [x] `src/lib/validations/finance-planner.test.ts` — 7 schemas (month/year range, coercion, UUIDs)
- [x] `src/lib/validations/subscription.test.ts` — `subscriptionCreateSchema` (+ `superRefine` cross-field), `subscriptionUpdateSchema`

### 2.5 Chart utilities

- [x] `src/components/charts/format-chart-currency.test.ts` — `formatChartCurrency`, `formatChartPercent`
- [x] `src/components/charts/trend-chart-data.test.ts` — 8 functions (label formatting, data transformations)

### 2.6 Finance planner utilities

- [x] `src/components/finance-planner/utils.test.ts` — 9 functions (dialog titles, formatting, date conversions)

---

## Phase 3 — Redux slice tests

> Uses global server action mocks from Phase 1. Tests reducers and async thunk lifecycles.

- [x] `src/store/features/auth.test.ts` — `fetchSession` (pending/fulfilled/rejected), `fetchUserProfile`, `clearAuthState`
- [x] `src/store/features/subscriptions.test.ts` — `fetchSubscriptions`, `fetchSubscriptionFormOptions`, create/update/delete thunks + array mutations, `clearSubscriptionsState`
- [x] `src/store/features/finance.test.ts` — `setSelectedMonth`, `fetchMonthlyPlan`, 6 CUD thunks (chained `fetchMonthlyPlan` re-dispatch), `clearFinanceState`
- [x] `src/store/selectors/finance.test.ts` — memoized selectors (if/when created)

---

## Phase 4 — Component tests

> Uses `renderWithProviders` from Phase 1. Progresses from simple UI to feature components.

### 4.1 UI primitives (expand `button.test.tsx` pattern)

- [ ] `src/components/ui/input.test.tsx`
- [ ] `src/components/ui/label.test.tsx`
- [ ] `src/components/ui/card.test.tsx`
- [ ] `src/components/ui/dialog.test.tsx`
- [ ] `src/components/ui/form.test.tsx`
- [ ] `src/components/ui/input-otp.test.tsx`
- [ ] `src/components/ui/chart.test.tsx`

### 4.2 Feature components

- [ ] `src/components/global/LocaleLink.test.tsx`
- [ ] `src/components/global/LocaleSwitcher.test.tsx`
- [ ] `src/components/layout/PlatformLayout.test.tsx` — uses SidebarProvider
- [ ] `src/components/layout/sidebar/index.test.tsx`
- [ ] `src/components/subscriptions/subscriptions-manager.test.tsx`
- [ ] `src/components/subscriptions/subscription-form.test.tsx`
- [ ] `src/components/dashboard/*.test.tsx`
- [ ] `src/components/finance-planner/*.test.tsx`
- [ ] `src/components/charts/*.test.tsx`
- [ ] `src/components/settings/*.test.tsx`

---

## Phase 5 — Server action tests

> Mock Prisma + Better Auth. Test each action's full lifecycle.

- [ ] Create `src/test-utils/prisma-mock.ts` — PrismaClient factory with all query methods
- [ ] `src/server/actions/auth/get-session.test.ts`
- [ ] `src/server/actions/auth/sign-out.test.ts`
- [ ] `src/server/actions/user/get.test.ts`
- [ ] `src/server/actions/user/update-settings.test.ts`
- [ ] `src/server/actions/user/change-language.test.ts`
- [ ] `src/server/actions/subscriptions/list.test.ts`
- [ ] `src/server/actions/subscriptions/get.test.ts`
- [ ] `src/server/actions/subscriptions/create.test.ts`
- [ ] `src/server/actions/subscriptions/update.test.ts`
- [ ] `src/server/actions/subscriptions/delete.test.ts`
- [ ] `src/server/actions/subscriptions/form-options.test.ts`
- [ ] `src/server/actions/finance-planner/get.test.ts` — `getMonthlyPlan`
- [ ] `src/server/actions/finance-planner/summary.test.ts` — `getMonthSummary`
- [ ] `src/server/actions/finance-planner/trend.test.ts` — `getFinanceTrend`
- [ ] `src/server/actions/finance-planner/create.test.ts` — `createPlannedIncome`, `createPlannedExpense`
- [ ] `src/server/actions/finance-planner/update.test.ts` — `updatePlannedIncome`, `updatePlannedExpense`
- [ ] `src/server/actions/finance-planner/delete.test.ts` — `deletePlannedIncome`, `deletePlannedExpense`
- [ ] `src/server/actions/finance-planner/form-options.test.ts`
- [ ] `src/server/actions/payment-methods/index.test.ts`

---

## Appendix: File reference

| File | Purpose |
|---|---|
| `vitest.config.mts` | Vitest configuration (environment, setup, plugins) |
| `vitest.setup.ts` | Setup file: jest-dom matchers + global module mocks |
| `src/test-utils/render.tsx` | Custom `renderWithProviders` + store factory |
| `src/test-utils/index.ts` | Barrel re-exports |
