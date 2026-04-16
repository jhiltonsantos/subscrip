export const locales = ["en", "pt"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export const localeToLanguage = {
  en: "en-US",
  pt: "pt-BR",
} as const satisfies Record<Locale, string>

export type UserLanguage = (typeof localeToLanguage)[Locale]
