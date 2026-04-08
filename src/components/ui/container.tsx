import { cn } from "@/lib/utils/helpers"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full",
        // Mobile
        "px-4 py-4 pb-20 md:pb-6",
        // Tablet
        "md:px-6 md:py-6",
        // Desktop
        "lg:px-8 lg:py-8 lg:max-w-6xl xl:max-w-7xl",
        className
      )}
    >
      {children}
    </section>
  )
}
