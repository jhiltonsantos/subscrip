"use client"

import { Header } from "./header"

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Header variant="landing" />
      <main className="relative z-0 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">{children}</main>
    </div>
  )
}
