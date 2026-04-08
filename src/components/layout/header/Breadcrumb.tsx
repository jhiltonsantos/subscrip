"use client"

import { ChevronRight, Home } from "lucide-react"
import { LocaleLink } from "@/components/global"
import { usePathname } from "next/navigation"

export function Breadcrumb() {
  const pathname = usePathname()
  
  const segments = pathname
    .replace(/^\/(pt\/)?/, "")
    .split("/")
    .filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center gap-2 text-sm">
      <LocaleLink 
        href="/dashboard" 
        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <Home className="h-4 w-4" />
      </LocaleLink>
      
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {label}
              </span>
            ) : (
              <LocaleLink 
                href={href}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors capitalize"
              >
                {label}
              </LocaleLink>
            )}
          </div>
        )
      })}
    </nav>
  )
}
