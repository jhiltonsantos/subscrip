"use client"

import NextLink from "next/link"
import { useLocale } from "next-intl"
import { ComponentProps } from "react"

type LocaleLinkProps = ComponentProps<typeof NextLink>

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale()

  const resolvedHref =
    locale === "pt" && typeof href === "string" && href.startsWith("/")
      ? `/pt${href}`
      : href

  return <NextLink href={resolvedHref} {...props} />
}
