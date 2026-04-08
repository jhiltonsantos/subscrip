import { defaultLocale, locales, Locale } from "./config"

type ServerMessages = Record<string, unknown>

const cache = new Map<string, ServerMessages>()

export async function getServerTranslation(locale?: string): Promise<ServerMessages> {
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale

  if (cache.has(validLocale)) {
    return cache.get(validLocale)!
  }

  const messages = (await import(`@/translations/server/${validLocale}.json`)).default
  cache.set(validLocale, messages)
  return messages
}

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === "string" ? current : path
}

export async function serverT(locale: string | undefined, key: string): Promise<string> {
  const messages = await getServerTranslation(locale)
  return getNestedValue(messages as Record<string, unknown>, key)
}
