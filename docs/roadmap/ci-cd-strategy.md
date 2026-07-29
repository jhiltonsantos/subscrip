# CI/CD Strategy — GitHub Actions + Vercel

## Overview

Subscrip uses GitHub Actions for continuous integration and Vercel for continuous deployment. The CI pipeline runs on every push to `staging` and `main` (production) branches to catch issues before Vercel's automatic deployment.

## Pipeline Flow

```
Push to staging/main
    ↓
[1] ESLint (code quality)
    ↓
[2] Unit Tests (Vitest)
    ↓
[3] Typecheck (TypeScript validation)
    ↓
[4] Vercel Deployment (automatic via GitHub integration)
```

**Note**: CI does NOT run a full build. Vercel handles the actual build during deployment. CI only validates code quality and catches TypeScript errors early.

## Workflow: `ci.yml`

### Triggers

```yaml
on:
  push:
    branches:
      - staging    # Pre-production validation
      - main       # Production deployment
  pull_request:
    branches:
      - staging
      - main
```

### Environment Setup

**Node.js version**: 20.x (required for Next.js 16, React 19)
**pnpm version**: 9.x (latest stable)

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    
- uses: pnpm/action-setup@v4
  with:
    version: 9
```

### Step 1: Install Dependencies

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

**Why `--frozen-lockfile`**: Ensures CI uses exact versions from `pnpm-lock.yaml`, preventing drift between local and CI environments.

### Step 2: ESLint

```yaml
- name: Run ESLint
  run: pnpm lint
```

**Purpose**: Catch code quality issues, unused imports, React hook violations, and Next.js best practices.

**Config**: `eslint.config.mjs` (flat config format, ESLint 9)
- Extends `eslint-config-next/core-web-vitals`
- Extends `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**Failure handling**: Pipeline stops if lint fails. Developer must fix issues before proceeding.

### Step 3: Unit Tests (Vitest)

```yaml
- name: Run unit tests
  run: pnpm test
```

**Purpose**: Validate business logic, validation schemas, Redux slices, formatters, and chart helpers.

**Config**: `vitest.config.mts`
- Environment: `jsdom` (for React component testing)
- Setup: `vitest.setup.ts` (mocks server actions, next/navigation)
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Coverage: 17 test files (validation, Redux, formatters, chart helpers)

**Failure handling**: Pipeline stops if any test fails. Developer must fix or update tests.

### Step 4: Typecheck

```yaml
- name: Typecheck
  run: pnpm typecheck
```

**Purpose**: Catch TypeScript errors before Vercel deployment.

**Why no full build in CI**:
- Vercel already performs a complete build during deployment
- Running build in CI would duplicate work and slow down feedback
- Typecheck catches most errors in ~30 seconds vs ~3-5 minutes for full build
- Faster iteration cycle for developers

**Failure handling**: Pipeline stops if typecheck fails. Vercel deployment is skipped.

### Step 5: Vercel Deployment (Automatic)

Vercel's GitHub integration automatically deploys when CI passes:
- `staging` branch → Vercel Preview Deployment (staging environment)
- `main` branch → Vercel Production Deployment

**No explicit GitHub Actions step needed** — Vercel handles this via webhook.

**Vercel configuration**: Zero-config (no `vercel.json` required). Next.js 16 is auto-detected.

## Required GitHub Secrets

**No secrets required for CI** — The pipeline only runs lint, tests, and typecheck, which don't need database connections or auth configuration.

Vercel handles environment variables separately during deployment. Configure them in **Vercel Dashboard → Project → Settings → Environment Variables**.

## Branch Strategy

### `staging` branch
- **Purpose**: Pre-production validation
- **CI triggers**: ESLint → Tests → Pre-build → Vercel Preview
- **Deployment**: Vercel Preview URL (e.g., `staging--subscrip.vercel.app`)
- **Who pushes**: Developers after PR approval

### `main` branch
- **Purpose**: Production
- **CI triggers**: ESLint → Tests → Pre-build → Vercel Production
- **Deployment**: Vercel Production URL (e.g., `subscrip.com`)
- **Who pushes**: Release manager after staging validation

### Pull Requests
- **CI triggers**: ESLint → Tests → Pre-build (no deployment)
- **Purpose**: Validate code quality before merge
- **Merge target**: `staging` (feature branches → staging → main)

## Caching Strategy

Speed up CI with pnpm dependency caching:

```yaml
- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

**Benefit**: Reduces `pnpm install` from ~30s to ~5s on cache hit.

## Optional Enhancements (Post-v1)

### 1. Test Coverage Reporting
```yaml
- name: Run tests with coverage
  run: pnpm test -- --coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    flags: unittests
    fail_ci_if_error: false
```

### 2. Build Artifact Caching
Cache `.next/cache` to speed up subsequent builds:

```yaml
- name: Setup Next.js cache
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 3. E2E Tests (Playwright)
Add after unit tests, before pre-build:

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm exec playwright test
```

### 4. Lighthouse CI
Validate performance and accessibility:

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v12
  with:
    urls: |
      https://staging--subscrip.vercel.app
    budgetPath: ./lighthouse-budget.json
```

### 5. Dependency Audit
Check for security vulnerabilities:

```yaml
- name: Audit dependencies
  run: pnpm audit --audit-level=high
  continue-on-error: true  # Don't block CI, just warn
```

## Troubleshooting

### Typecheck fails in CI but works locally
**Cause**: Different TypeScript versions or missing type definitions
**Fix**: Ensure `pnpm install --frozen-lockfile` is used, check `tsconfig.json`

### Prisma errors in CI
**Cause**: Prisma client not generated
**Fix**: Ensure `pnpm exec prisma generate` runs before `pnpm build` (already included in `pnpm build` script)

### Tests pass locally but fail in CI
**Cause**: Environment differences (jsdom vs browser)
**Fix**: Check `vitest.setup.ts` mocks, ensure all server actions are mocked

### Lint passes locally but fails in CI
**Cause**: Different ESLint versions or config
**Fix**: Ensure `pnpm install --frozen-lockfile` is used, check `.eslintignore` and `eslint.config.mjs`

### Vercel deployment fails after CI passes
**Cause**: Vercel environment variables not set or build-time errors
**Fix**: Configure environment variables in Vercel Dashboard → Project → Settings → Environment Variables. Check Vercel build logs for specific errors.

## Migration Path

### Current State (No CI)
- Manual validation before push
- Vercel auto-deploys on push (no pre-validation)
- Errors discovered after deployment

### Target State (With CI)
- Automated validation on every push
- Pre-build catches errors before Vercel
- Faster feedback loop (2-3 min vs 5-10 min)
- Clear separation: CI validates, Vercel deploys

## Implementation Checklist

- [x] Create `.github/workflows/ci.yml`
- [ ] Test workflow on `staging` branch
- [ ] Verify Vercel integration (auto-deploy on CI pass)
- [ ] Document branch strategy in `AGENTS.md`
- [ ] Add CI status badge to `README.md`

## References

- GitHub Actions documentation: https://docs.github.com/en/actions
- Vercel GitHub integration: https://vercel.com/docs/deployments/git/vercel-for-github
- pnpm in CI: https://pnpm.io/continuous-integration
- Vitest CI guide: https://vitest.dev/guide/cli.html
