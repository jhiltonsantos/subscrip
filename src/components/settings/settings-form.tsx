"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  USER_SETTINGS_CURRENCY_VALUES,
  USER_SETTINGS_LANGUAGE_VALUES,
  USER_SETTINGS_REMINDER_CHANNEL_VALUES,
  USER_SETTINGS_THEME_VALUES,
  type UserSettingsCurrency,
  type UserSettingsLanguage,
  type UserSettingsReminderChannel,
  type UserSettingsTheme,
} from "@/lib/user-settings-constants"
import {
  userSettingsSchema,
  type UserSettingsInput,
} from "@/lib/validations/user-settings"
import { updateUserSettings } from "@/server/actions/user"
import { cn } from "@/lib/utils/helpers"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const selectClassName = cn(
  "border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type SettingsUser = {
  name: string | null
  email: string
  language: string
  preferredCurrency: UserSettingsCurrency
  theme: UserSettingsTheme
  defaultReminderDays: number
  defaultReminderChannel: UserSettingsReminderChannel
}

type SettingsFormProps = {
  user: SettingsUser
}

function normalizeLanguage(language: string): UserSettingsLanguage {
  return USER_SETTINGS_LANGUAGE_VALUES.includes(language as UserSettingsLanguage)
    ? (language as UserSettingsLanguage)
    : "en-US"
}

function createDefaultValues(user: SettingsUser): UserSettingsInput {
  return {
    name: user.name ?? "",
    preferredCurrency: user.preferredCurrency,
    theme: user.theme,
    language: normalizeLanguage(user.language),
    defaultReminderDays: user.defaultReminderDays,
    defaultReminderChannel: user.defaultReminderChannel,
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations("settingsPage")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UserSettingsInput>({
    resolver: zodResolver(userSettingsSchema) as Resolver<UserSettingsInput>,
    defaultValues: createDefaultValues(user),
  })

  function onSubmit(values: UserSettingsInput) {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await updateUserSettings(values)

      if (result.success) {
        form.reset(createDefaultValues(result.data))
        setSuccess(t("form.success"))
        return
      }

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof UserSettingsInput, {
              message: messages[0],
            })
          }
        }
      }

      setError(result.error || t("form.error"))
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-emerald-600 dark:text-emerald-400 text-sm" role="status">
                {success}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <Label htmlFor="settings-email">{t("form.email")}</Label>
                <Input id="settings-email" value={user.email} disabled readOnly />
                <p className="text-muted-foreground text-sm">
                  {t("form.emailDescription")}
                </p>
              </div>

              <FormField
                control={form.control}
                name="preferredCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.preferredCurrency")}</FormLabel>
                    <FormControl>
                      <select className={selectClassName} {...field}>
                        {USER_SETTINGS_CURRENCY_VALUES.map((currency) => (
                          <option key={currency} value={currency}>
                            {t(`options.currency.${currency}`)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.theme")}</FormLabel>
                    <FormControl>
                      <select className={selectClassName} {...field}>
                        {USER_SETTINGS_THEME_VALUES.map((theme) => (
                          <option key={theme} value={theme}>
                            {t(`options.theme.${theme}`)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.language")}</FormLabel>
                    <FormControl>
                      <select className={selectClassName} {...field}>
                        {USER_SETTINGS_LANGUAGE_VALUES.map((language) => (
                          <option key={language} value={language}>
                            {t(`options.language.${language}`)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultReminderChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.defaultReminderChannel")}</FormLabel>
                    <FormControl>
                      <select className={selectClassName} {...field}>
                        {USER_SETTINGS_REMINDER_CHANNEL_VALUES.map((channel) => (
                          <option key={channel} value={channel}>
                            {t(`options.reminderChannel.${channel}`)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultReminderDays"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("form.defaultReminderDays")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        {...field}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("form.defaultReminderDaysDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? t("form.saving") : t("form.save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
