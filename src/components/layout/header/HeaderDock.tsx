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
    <div className="w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-full border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
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
