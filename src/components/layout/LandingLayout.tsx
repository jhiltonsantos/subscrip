"use client"

import { Header } from "./header"

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-(--shell-gradient-from) via-background to-(--shell-gradient-to)">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-20 top-10 h-64 w-64 animate-pulse rounded-full bg-emerald-300/50 blur-3xl dark:bg-emerald-600/35" />
          <div className="absolute -right-16 bottom-20 h-72 w-72 animate-pulse rounded-full bg-emerald-400/35 blur-3xl delay-700 dark:bg-emerald-700/25" />
          <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-700/15" />
        </div>

        <Header variant="landing" />
        <main className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
