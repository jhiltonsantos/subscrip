"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 relative"
      title="Notifications"
    >
      <Bell className="h-4 w-4" />
      {/* Badge para notificações não lidas */}
      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-950" />
    </Button>
  )
}
