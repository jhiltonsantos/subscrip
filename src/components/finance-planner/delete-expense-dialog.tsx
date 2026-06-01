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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("form.cancel")}
          </Button>
          <Button type="button" variant="outline" onClick={onDeleteSingle}>
            {t("deleteDialog.single")}
          </Button>
          {row?.recurrenceGroupId ? (
            <Button type="button" variant="destructive" onClick={onDeleteFuture}>
              {t("deleteDialog.future")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
