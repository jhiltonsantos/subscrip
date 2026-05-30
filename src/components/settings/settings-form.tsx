"use client"

import type { ComponentType } from "react"
import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import {
  USER_SETTINGS_CURRENCY_VALUES,
  USER_SETTINGS_LANGUAGE_VALUES,
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
import {
  Bell,
  BellRing,
  Check,
  DollarSign,
  Languages,
  Mail,
  Monitor,
  Moon,
  Sun,
} from "lucide-react"
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

type OptionCard<T extends string> = {
  value: T
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
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

function themeToNextTheme(theme: UserSettingsTheme): "light" | "dark" | "system" {
  if (theme === "LIGHT") return "light"
  if (theme === "DARK") return "dark"
  return "system"
}

function languageToLocale(language: UserSettingsLanguage): "en" | "pt" {
  return language === "pt-BR" ? "pt" : "en"
}

function localizedPath(pathname: string, language: UserSettingsLanguage): string {
  const cleanPath = pathname.replace(/^\/pt(?=\/|$)/, "") || "/"
  const locale = languageToLocale(language)

  if (locale === "pt") {
    return cleanPath === "/" ? "/pt" : `/pt${cleanPath}`
  }

  return cleanPath
}

function OptionCardGroup<T extends string>({
  value,
  onChange,
  options,
  columns = "sm:grid-cols-3",
}: {
  value: T
  onChange: (value: T) => void
  options: OptionCard<T>[]
  columns?: string
}) {
  return (
    <div
      role="radiogroup"
      className={cn("grid gap-3", columns)}
    >
      {options.map((option) => {
        const selected = option.value === value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-xl border bg-background/60 p-4 text-left transition-all",
              "hover:border-emerald-500/60 hover:bg-emerald-500/5",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
              selected
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border/70 text-foreground"
            )}
          >
            <span className="flex items-start gap-3">
              <span
                className={cn(
                  "rounded-lg border p-2",
                  selected
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : "border-border/70 bg-muted/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                  {option.description}
                </span>
              </span>
            </span>
            {selected ? (
              <Check className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations("settingsPage")
  const router = useRouter()
  const pathname = usePathname()
  const { setTheme } = useTheme()
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
        const updatedValues = createDefaultValues(result.data)
        const nextPath = localizedPath(pathname, updatedValues.language)

        setTheme(themeToNextTheme(updatedValues.theme))
        form.reset(updatedValues)
        setSuccess(t("form.success"))

        if (nextPath !== pathname) {
          router.push(nextPath)
        } else {
          router.refresh()
        }

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

  const currencyOptions: OptionCard<UserSettingsCurrency>[] =
    USER_SETTINGS_CURRENCY_VALUES.map((currency) => ({
      value: currency,
      label: t(`options.currency.${currency}`),
      description: t(`descriptions.currency.${currency}`),
      icon: DollarSign,
    }))

  const themeOptions: OptionCard<UserSettingsTheme>[] = [
    {
      value: "LIGHT",
      label: t("options.theme.LIGHT"),
      description: t("descriptions.theme.LIGHT"),
      icon: Sun,
    },
    {
      value: "DARK",
      label: t("options.theme.DARK"),
      description: t("descriptions.theme.DARK"),
      icon: Moon,
    },
    {
      value: "SYSTEM",
      label: t("options.theme.SYSTEM"),
      description: t("descriptions.theme.SYSTEM"),
      icon: Monitor,
    },
  ]

  const languageOptions: OptionCard<UserSettingsLanguage>[] =
    USER_SETTINGS_LANGUAGE_VALUES.map((language) => ({
      value: language,
      label: t(`options.language.${language}`),
      description: t(`descriptions.language.${language}`),
      icon: Languages,
    }))

  const reminderChannelOptions: OptionCard<UserSettingsReminderChannel>[] = [
    {
      value: "EMAIL",
      label: t("options.reminderChannel.EMAIL"),
      description: t("descriptions.reminderChannel.EMAIL"),
      icon: Mail,
    },
    {
      value: "PUSH",
      label: t("options.reminderChannel.PUSH"),
      description: t("descriptions.reminderChannel.PUSH"),
      icon: Bell,
    },
    {
      value: "BOTH",
      label: t("options.reminderChannel.BOTH"),
      description: t("descriptions.reminderChannel.BOTH"),
      icon: BellRing,
    },
  ]

  const reminderDayPresets = [0, 1, 3, 7, 15, 30]

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

            <div className="grid gap-5 md:grid-cols-2">
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
                <div className="rounded-xl border border-border/80 cursor-not-allowed bg-muted/30 py-2 px-4">
                  <p
                    id="settings-email"
                    className="text-sm font-medium text-foreground"
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="preferredCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.preferredCurrency")}</FormLabel>
                  <OptionCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={currencyOptions}
                  />
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
                  <OptionCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={themeOptions}
                  />
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
                  <OptionCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={languageOptions}
                    columns="sm:grid-cols-2"
                  />
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
                  <OptionCardGroup
                    value={field.value}
                    onChange={field.onChange}
                    options={reminderChannelOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultReminderDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.defaultReminderDays")}</FormLabel>
                  <div className="grid gap-3">
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        {...field}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2">
                      {reminderDayPresets.map((days) => (
                        <Button
                          key={days}
                          type="button"
                          variant={
                            Number(field.value) === days ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => field.onChange(days)}
                        >
                          {t("form.quickReminderDays", { days })}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormDescription>
                    {t("form.defaultReminderDaysDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
