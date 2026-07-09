export function planDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function currentPlanRef(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}
