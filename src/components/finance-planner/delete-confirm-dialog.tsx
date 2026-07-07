import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TranslationFn } from "./types"

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  isPending = false,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName?: string | null
  isPending?: boolean
  t: TranslationFn
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteConfirmDialog.title")}</DialogTitle>
          <DialogDescription>
            {itemName
              ? t("deleteConfirmDialog.descriptionWithName", { name: itemName })
              : t("deleteConfirmDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex w-full flex-row items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("deleteConfirmDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            disabled={isPending}
            onClick={onConfirm}
          >
            {t("deleteConfirmDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
