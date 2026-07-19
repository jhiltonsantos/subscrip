export function planDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function currentPlanRef(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

export type MonthRef = {
  year: number
  month: number
}

export function getLastNMonths(
  endYear: number,
  endMonth: number,
  count: number
): MonthRef[] {
  const months: MonthRef[] = []
  let year = endYear
  let month = endMonth

  for (let index = 0; index < count; index++) {
    months.unshift({ year, month })
    month -= 1
    if (month < 1) {
      month = 12
      year -= 1
    }
  }

  return months
}

export function isMonthOnOrAfter(target: MonthRef, reference: MonthRef): boolean {
  return (
    target.year > reference.year ||
    (target.year === reference.year && target.month >= reference.month)
  )
}

export function monthOffset(from: MonthRef, to: MonthRef): number {
  return (to.year - from.year) * 12 + (to.month - from.month)
}

export function monthRefFromDateString(isoDate: string): MonthRef {
  const date = new Date(isoDate)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}
