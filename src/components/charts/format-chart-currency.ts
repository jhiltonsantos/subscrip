export function formatChartCurrency(value: number, locale: string, currency = "BRL") {
  const intlLocale = locale === "pt" ? "pt-BR" : "en-US"
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatChartPercent(value: number, locale: string) {
  const intlLocale = locale === "pt" ? "pt-BR" : "en-US"
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value / 100)
}
