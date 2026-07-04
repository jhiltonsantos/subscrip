import * as React from "react"
import { cn } from "@/lib/utils/helpers"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "glass-card text-card-foreground flex flex-col gap-6 py-6 transition-all duration-200 hover:shadow-lg",
        className,
      )}
      {...props}
    />
  )
}

export { Card }
