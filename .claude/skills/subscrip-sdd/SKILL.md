---
name: subscrip-sdd
description: Use when starting a non-trivial feature or change, or when making an architectural decision for Subscrip. Covers the Spec-Driven Development flow, where specs and ADRs live, numbering, status and templates.
---

# Subscrip — Spec-Driven Development (specs + ADRs)

## Flow

1. **Spec first** for any non-trivial feature or behavior change: `docs/specs/NNNN-slug.md` (template: `docs/specs/0000-template.md`). Trivial fixes need no spec.
2. **ADR when a decision is made** (new dependency, data model shape, auth/i18n/state approach, anything costly to reverse): `docs/decisions/NNNN-slug.md` (template: `docs/decisions/0000-template.md`). Link it from the spec.
3. **Implement** against the spec's acceptance criteria, following `subscrip-standards`.
4. **Validate** per `subscrip-workflow` and tick the spec's validation checklist.

## Rules

- Numbers are 4 digits, sequential, never reused. Check the highest existing number in the folder first.
- File names are kebab-case.
- Spec status: `draft` → `approved` → `implemented`.
- ADR status: `proposed` → `accepted` → `superseded by NNNN`. An accepted ADR is not rewritten; a changed decision is a new ADR that supersedes the old one.
- Every spec must state its `userId` boundary (which data is user-owned) and i18n impact (en + pt).
- Keep both folders' `README.md` index tables up to date.
- Agents: `spec-writer`, `adr-writer` (commands `/spec`, `/adr`); `security-reviewer` before merging server action changes.
