"use client"

import { Header } from "./header"

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header variant="landing" />
      <main className="flex-1">{children}</main>
    </div>
  )
}
