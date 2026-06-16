import { z } from "zod"
import {
  USER_SETTINGS_CURRENCY_VALUES,
  USER_SETTINGS_DARK_THEME_VARIANT_VALUES,
  USER_SETTINGS_LANGUAGE_VALUES,
  USER_SETTINGS_REMINDER_CHANNEL_VALUES,
  USER_SETTINGS_THEME_VALUES,
} from "@/lib/user-settings-constants"

export const userSettingsSchema = z.object({
  name: z.string().max(120).optional(),
  preferredCurrency: z.enum(USER_SETTINGS_CURRENCY_VALUES),
  theme: z.enum(USER_SETTINGS_THEME_VALUES),
  darkThemeVariant: z.enum(USER_SETTINGS_DARK_THEME_VARIANT_VALUES),
  language: z.enum(USER_SETTINGS_LANGUAGE_VALUES),
  defaultReminderDays: z.coerce.number().int().min(0).max(365),
  defaultReminderChannel: z.enum(USER_SETTINGS_REMINDER_CHANNEL_VALUES),
})

export const darkThemeVariantSchema = z.object({
  darkThemeVariant: z.enum(USER_SETTINGS_DARK_THEME_VARIANT_VALUES),
})

export type UserSettingsInput = z.infer<typeof userSettingsSchema>
export type DarkThemeVariantInput = z.infer<typeof darkThemeVariantSchema>
