"use client"

import { AuthLayout } from "@/components/layout"

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
