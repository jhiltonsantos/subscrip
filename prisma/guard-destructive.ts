const LOCAL_DB_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'postgres',
  'host.docker.internal',
])

const REMOTE_DB_HOST_SUFFIXES = [
  '.neon.tech',
  '.supabase.co',
  '.railway.app',
  '.render.com',
  '.amazonaws.com',
  '.digitalocean.com',
  '.cockroachlabs.cloud',
]

function parseDatabaseHost(databaseUrl: string): string | null {
  try {
    const normalized = databaseUrl.replace(/^postgres(ql)?:\/\//, 'http://')
    return new URL(normalized).hostname.toLowerCase()
  } catch {
    return null
  }
}

function isLocalDatabaseHost(host: string): boolean {
  return LOCAL_DB_HOSTS.has(host)
}

function isKnownRemoteDatabaseHost(host: string): boolean {
  return REMOTE_DB_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
}

export function getUnsafeDatabaseReasons(): string[] {
  const reasons: string[] = []

  if (process.env.NODE_ENV === 'production') {
    reasons.push('NODE_ENV is "production"')
  }

  if (process.env.VERCEL === '1') {
    reasons.push('VERCEL is set (production/preview runtime)')
  }

  if (process.env.DATABASE_ENV === 'production') {
    reasons.push('DATABASE_ENV is "production"')
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    reasons.push('DATABASE_URL is not set')
    return reasons
  }

  const host = parseDatabaseHost(databaseUrl)
  if (!host) {
    reasons.push('DATABASE_URL could not be parsed safely')
    return reasons
  }

  if (isKnownRemoteDatabaseHost(host)) {
    reasons.push(`DATABASE_URL points to a remote managed database (${host})`)
    return reasons
  }

  if (!isLocalDatabaseHost(host)) {
    reasons.push(`DATABASE_URL host "${host}" is not a recognized local database`)
  }

  return reasons
}

export function assertSafeForDestructiveDbOps(operation: string): void {
  if (process.env.ALLOW_DESTRUCTIVE_DB_OPS === '1') {
    console.warn(
      `⚠️  ALLOW_DESTRUCTIVE_DB_OPS=1 — proceeding with destructive operation: ${operation}`,
    )
    return
  }

  const reasons = getUnsafeDatabaseReasons()
  if (reasons.length === 0) {
    return
  }

  console.error(`\n❌ Blocked destructive database operation: ${operation}\n`)
  for (const reason of reasons) {
    console.error(`   • ${reason}`)
  }
  console.error('\nThis guard protects production and remote databases from data loss.')
  console.error('Use a local DATABASE_URL (localhost / docker postgres) for dev-only commands.')
  console.error('For production, use: pnpm db:deploy')
  console.error('To override intentionally, set ALLOW_DESTRUCTIVE_DB_OPS=1\n')
  process.exit(1)
}
