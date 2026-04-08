"use client"

import { Header } from "./Header"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-emerald-50 via-background to-emerald-100/50 dark:from-emerald-950/30 dark:via-background dark:to-emerald-900/20">
      <Header variant="auth" />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  )
}
