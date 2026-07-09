import { getUnsafeDatabaseReasons } from './guard-destructive'

export const DEFAULT_DEMO_USER_EMAIL = 'jhilton930+subscrip@gmail.com'

export function getDemoUserEmail(): string {
  return process.env.DEMO_USER_EMAIL?.trim() || DEFAULT_DEMO_USER_EMAIL
}

function requiresExplicitApproval(): boolean {
  return getUnsafeDatabaseReasons().length > 0
}

export function assertProdDemoSeedAllowed(): string {
  const demoEmail = getDemoUserEmail()

  if (!demoEmail) {
    console.error('\n❌ Blocked production demo seed: DEMO_USER_EMAIL is empty\n')
    process.exit(1)
  }

  if (requiresExplicitApproval() && process.env.ALLOW_PROD_DEMO_SEED !== '1') {
    const reasons = getUnsafeDatabaseReasons()
    console.error('\n❌ Blocked production demo seed\n')
    for (const reason of reasons) {
      console.error(`   • ${reason}`)
    }
    console.error('\nThis seed only affects the demo user, but still writes to a protected database.')
    console.error(`Target email: ${demoEmail}`)
    console.error('To proceed intentionally, set ALLOW_PROD_DEMO_SEED=1\n')
    process.exit(1)
  }

  if (process.env.ALLOW_PROD_DEMO_SEED === '1') {
    console.warn('⚠️  ALLOW_PROD_DEMO_SEED=1 — proceeding with scoped demo seed')
  }

  console.log(`🎯 Demo seed target: ${demoEmail}`)
  return demoEmail
}
