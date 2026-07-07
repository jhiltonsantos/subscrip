"use client"

import * as React from "react"

import { cn } from "@/lib/utils/helpers"
import { useFormField } from "./use-form-field"

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export { FormDescription }
