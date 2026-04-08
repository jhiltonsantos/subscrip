import { cn } from "@/lib/utils/helpers"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl px-6 py-6", className)}>
      {children}
    </section>
  )
}
