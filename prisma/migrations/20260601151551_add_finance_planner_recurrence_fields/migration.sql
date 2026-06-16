-- CreateEnum
CREATE TYPE "RecurrenceKind" AS ENUM ('INSTALLMENT', 'MONTHLY_RECURRING');

-- AlterTable
ALTER TABLE "PlannedExpense" ADD COLUMN     "description" TEXT,
ADD COLUMN     "merchantName" TEXT,
ADD COLUMN     "recurrenceGroupId" TEXT,
ADD COLUMN     "recurrenceKind" "RecurrenceKind";

-- CreateIndex
CREATE INDEX "PlannedExpense_recurrenceGroupId_idx" ON "PlannedExpense"("recurrenceGroupId");
