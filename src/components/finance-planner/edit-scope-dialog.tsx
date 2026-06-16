import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TranslationFn } from "./types"

export function EditScopeDialog({
  open,
  onOpenChange,
  onEditSingle,
  onEditFuture,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSingle: () => void
  onEditFuture: () => void
  t: TranslationFn
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editScopeDialog.title")}</DialogTitle>
          <DialogDescription>{t("editScopeDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onEditSingle}
            className="h-auto min-w-0 w-full justify-start whitespace-normal rounded-lg p-4 text-left"
          >
            <span className="grid min-w-0 gap-1">
              <span>{t("editScopeDialog.single")}</span>
              <span className="whitespace-normal text-xs font-normal leading-relaxed text-muted-foreground">
                {t("editScopeDialog.singleDescription")}
              </span>
            </span>
          </Button>
          <Button
            type="button"
            onClick={onEditFuture}
            className="h-auto min-w-0 w-full justify-start whitespace-normal rounded-lg p-4 text-left"
          >
            <span className="grid min-w-0 gap-1">
              <span>{t("editScopeDialog.future")}</span>
              <span className="whitespace-normal text-xs font-normal leading-relaxed text-primary-foreground/80">
                {t("editScopeDialog.futureDescription")}
              </span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
