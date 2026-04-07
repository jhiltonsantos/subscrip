"use client"

import { LandingLayout } from "@/components/layout"

export default function LandingRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LandingLayout>{children}</LandingLayout>
}
