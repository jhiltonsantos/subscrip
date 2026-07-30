---
name: subscrip-ci-cd
description: Use when configuring GitHub Actions workflows, setting up CI/CD pipelines, troubleshooting build failures, or managing Vercel deployments for Subscrip. Covers pipeline structure, required secrets, branch strategy, and validation steps.
---

# Subscrip — CI/CD Configuration Guide

## Pipeline Overview

Subscrip uses GitHub Actions for CI and Vercel for CD. The pipeline validates code quality before Vercel's automatic deployment.

```
Push to staging/main
    ↓
[1] ESLint (code quality)
    ↓
[2] Unit Tests (Vitest)
    ↓
[3] Typecheck (TypeScript validation)
    ↓
[4] Vercel Deployment (automatic)
```

**Note**: CI does NOT run a full build. Vercel handles the actual build during deployment.

## Workflow File

**Location**: `.github/workflows/ci.yml`

**Triggers**:
- Push to `staging` or `main`
- Pull requests to `staging` or `main`

## Pipeline Steps

### 1. Environment Setup
- **Node.js**: 24.x (latest LTS)
- **pnpm**: 9.x (latest stable)
- **Caching**: Automatic pnpm cache via `actions/setup-node` + Next.js cache

### 2. Install Dependencies
```bash
pnpm install --frozen-lockfile
```
Ensures exact versions from `pnpm-lock.yaml`.

### 3. ESLint
```bash
pnpm lint
```
- Config: `eslint.config.mjs` (ESLint 9 flat config)
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- **Stricter rules** (errors, not warnings):
  - `@typescript-eslint/no-unused-vars`: Unused vars/imports are errors (prefix with `_` to ignore)
  - `@typescript-eslint/no-explicit-any`: Using `any` type is an error
- **Fails pipeline** if issues found

### 4. Unit Tests
```bash
pnpm test
```
- Config: `vitest.config.mts` (jsdom environment)
- Setup: `vitest.setup.ts` (mocks server actions, next/navigation)
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`
- **Fails pipeline** if tests fail

### 5. Typecheck
```bash
pnpm typecheck          # TypeScript validation
```
**Purpose**: Catch TypeScript errors before Vercel deployment.

**Why no full build**: Vercel already builds during deployment. Typecheck is faster (~30s vs ~3-5min) and catches most errors.

**No secrets required** — Typecheck doesn't need database or auth configuration.

### 6. Vercel Deployment (Automatic)
- `staging` → Vercel Preview (staging environment)
- `main` → Vercel Production
- **No explicit step needed** — Vercel handles via GitHub integration

## Branch Strategy

| Branch | Purpose | CI Triggers | Deployment |
|--------|---------|-------------|------------|
| `staging` | Pre-production | ESLint → Tests → Build → Deploy | Vercel Preview |
| `main` | Production | ESLint → Tests → Build → Deploy | Vercel Production |
| PRs | Code review | ESLint → Tests → Build (no deploy) | None |

## Required GitHub Secrets

**No secrets required for CI** — The pipeline only runs lint, tests, and typecheck.

Configure environment variables in **Vercel Dashboard** for deployment.

## Common Issues

### "packages field missing or empty" error
**Cause**: `pnpm-workspace.yaml` exists but doesn't define workspace packages
**Fix**: Delete `pnpm-workspace.yaml` if this is a single project (not a monorepo)

### Typecheck fails in CI but works locally
**Cause**: Different TypeScript versions or missing type definitions
**Fix**: Ensure `pnpm install --frozen-lockfile` is used, check `tsconfig.json`

### Prisma errors
**Cause**: Client not generated
**Fix**: `pnpm build` already includes `prisma generate`

### Tests pass locally, fail in CI
**Cause**: Environment differences
**Fix**: Check `vitest.setup.ts` mocks

### Vercel deploys after CI fails
**Cause**: Vercel not respecting CI status
**Fix**: Enable "Require CI pass" in Vercel project settings

## Implementation Checklist

- [x] Create `.github/workflows/ci.yml`
- [ ] Test on `staging` branch
- [ ] Verify Vercel integration
- [ ] Add CI badge to `README.md`

## Reference

Full strategy document: `docs/roadmap/ci-cd-strategy.md`
