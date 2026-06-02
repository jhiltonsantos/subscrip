-- AlterTable
ALTER TABLE "PlannedIncome" ADD COLUMN     "description" TEXT,
ADD COLUMN     "recurrenceGroupId" TEXT,
ADD COLUMN     "recurrenceKind" "RecurrenceKind";

-- CreateIndex
CREATE INDEX "PlannedIncome_recurrenceGroupId_idx" ON "PlannedIncome"("recurrenceGroupId");
