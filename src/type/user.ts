import { Currency, ReminderChannel, Theme } from "@prisma/client"

export type User = {
  id: string,
  name: string | null
  email: string
  image?: string | null
  language?: string
  preferredCurrency?: Currency
  theme?: Theme
  defaultReminderDays?: number
  defaultReminderChannel?: ReminderChannel
  createdAt?: Date
  updatedAt?: Date
}