export const USER_SETTINGS_CURRENCY_VALUES = ["BRL", "USD", "EUR"] as const
export type UserSettingsCurrency =
  (typeof USER_SETTINGS_CURRENCY_VALUES)[number]

export const USER_SETTINGS_THEME_VALUES = ["LIGHT", "DARK", "SYSTEM"] as const
export type UserSettingsTheme = (typeof USER_SETTINGS_THEME_VALUES)[number]

export const USER_SETTINGS_DARK_THEME_VARIANT_VALUES = [
  "BLUE",
  "BLACK",
] as const
export type UserSettingsDarkThemeVariant =
  (typeof USER_SETTINGS_DARK_THEME_VARIANT_VALUES)[number]

export const USER_SETTINGS_REMINDER_CHANNEL_VALUES = [
  "EMAIL",
  "PUSH",
  "BOTH",
] as const
export type UserSettingsReminderChannel =
  (typeof USER_SETTINGS_REMINDER_CHANNEL_VALUES)[number]

export const USER_SETTINGS_LANGUAGE_VALUES = ["en-US", "pt-BR"] as const
export type UserSettingsLanguage =
  (typeof USER_SETTINGS_LANGUAGE_VALUES)[number]
