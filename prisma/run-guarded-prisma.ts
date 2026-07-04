import { execSync } from 'child_process'

import { assertSafeForDestructiveDbOps } from './guard-destructive'

const prismaArgs = process.argv.slice(2)

if (prismaArgs.length === 0) {
  console.error('Usage: run-guarded-prisma.ts <prisma args...>')
  process.exit(1)
}

const operation = `prisma ${prismaArgs.join(' ')}`
assertSafeForDestructiveDbOps(operation)

execSync(`prisma ${prismaArgs.join(' ')}`, {
  stdio: 'inherit',
  env: process.env,
})
