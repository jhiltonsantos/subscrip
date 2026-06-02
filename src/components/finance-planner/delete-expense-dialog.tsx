import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PlannedExpense, TranslationFn } from "./types"

export function DeleteExpenseDialog({
  row,
  open,
  onOpenChange,
  onDeleteSingle,
  onDeleteFuture,
  t,
}: {
  row: PlannedExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleteSingle: () => void
  onDeleteFuture: () => void
  t: TranslationFn
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {row?.recurrenceGroupId
              ? t("deleteDialog.recurringDescription")
              : t("deleteDialog.singleDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex w-full flex-row items-center gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onDeleteSingle}>
            {t("deleteDialog.single")}
          </Button>
          {row?.recurrenceGroupId ? (
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onDeleteFuture}
            >
              {t("deleteDialog.future")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
