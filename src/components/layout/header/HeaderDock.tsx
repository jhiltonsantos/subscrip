"use client"

import { Breadcrumb } from "./Breadcrumb"
import { NotificationButton } from "./NotificationButton"
import { ThemeToggle } from "./ThemeToggle"
import { LocaleSwitcher } from "@/components/global"

interface HeaderDockProps {
  showBreadcrumb?: boolean
}

export function HeaderDock({ showBreadcrumb = true }: HeaderDockProps) {
  return (
    <div className="mx-auto w-full px-4 py-3 md:px-6 lg:max-w-6xl lg:px-8 xl:max-w-7xl">
      <div className="flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 py-3 bg-[var(--chrome-bg)] backdrop-blur-xl rounded-full border border-[var(--chrome-border)] shadow-lg">
        {/* Left: Breadcrumb */}
        <div className="flex-1">
          {showBreadcrumb && <Breadcrumb />}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <NotificationButton />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <LocaleSwitcher />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
