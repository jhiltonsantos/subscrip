-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "hiredAt" TIMESTAMP(3),
ADD COLUMN "billingDay" INTEGER;

-- Backfill hiredAt from startDate
UPDATE "Subscription" SET "hiredAt" = "startDate";

-- Backfill billingDay for monthly/weekly from nextBillingDate day
UPDATE "Subscription"
SET "billingDay" = EXTRACT(DAY FROM "nextBillingDate")::INTEGER
WHERE "billingCycle" IN ('MONTHLY', 'WEEKLY');

-- nextBillingDate is only required for YEARLY
ALTER TABLE "Subscription" ALTER COLUMN "nextBillingDate" DROP NOT NULL;

UPDATE "Subscription"
SET "nextBillingDate" = NULL
WHERE "billingCycle" <> 'YEARLY';

-- Drop startDate
ALTER TABLE "Subscription" DROP COLUMN "startDate";
