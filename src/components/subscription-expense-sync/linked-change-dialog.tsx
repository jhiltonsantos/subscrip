"use client"

import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type LinkedChangeVariant =
  | "createSubscription"
  | "editSubscription"
  | "deleteSubscription"
  | "toggleSubscription"
  | "editExpense"
  | "deleteExpense"

type LinkedChangeDialogProps = {
  open: boolean
  variant: LinkedChangeVariant
  itemName?: string | null
  isPending?: boolean
  error?: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const destructiveVariants: LinkedChangeVariant[] = [
  "deleteSubscription",
  "deleteExpense",
]

export function LinkedChangeDialog({
  open,
  variant,
  itemName,
  isPending = false,
  error,
  onOpenChange,
  onConfirm,
}: LinkedChangeDialogProps) {
  const t = useTranslations("linkedSubscriptionExpense")
  const isDestructive = destructiveVariants.includes(variant)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>{t(`${variant}.title`)}</DialogTitle>
          <DialogDescription>
            {itemName ? (
              <span className="mb-2 block font-medium text-foreground">
                {itemName}
              </span>
            ) : null}
            {t(`${variant}.description`)}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? t("confirming") : t(`${variant}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
