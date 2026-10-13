---
description: Targeted validation — run eslint and typecheck on the specified files. Pass file paths as arguments.
---

Run ESLint and TypeScript type checking on the specified files:

```bash
pnpm exec eslint $ARGUMENTS
pnpm exec tsc --noEmit --pretty false --incremental false
```

Report which checks passed and which failed. If no files are specified, ask which files to check.
