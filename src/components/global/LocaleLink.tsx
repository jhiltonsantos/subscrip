"use client"

import NextLink from "next/link"
import { useLocale } from "next-intl"
import { ComponentProps } from "react"
import { buildLocalizedPath } from "@/lib/i18n/locale-path"
import { Locale } from "@/lib/i18n/config"

type LocaleLinkProps = ComponentProps<typeof NextLink>

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale()

  const resolvedHref =
    typeof href === "string" && href.startsWith("/")
      ? buildLocalizedPath(href, locale as Locale)
      : href

  return <NextLink href={resolvedHref} {...props} />
}
