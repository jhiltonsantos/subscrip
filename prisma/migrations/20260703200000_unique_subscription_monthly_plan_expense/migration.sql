-- Deduplicate subscription expenses per monthly plan (keep the most recently updated row).
DELETE FROM "PlannedExpense" AS pe
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "subscriptionId", "monthlyPlanId"
        ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
      ) AS row_num
    FROM "PlannedExpense"
    WHERE "subscriptionId" IS NOT NULL
  ) ranked
  WHERE ranked.row_num > 1
) duplicates
WHERE pe.id = duplicates.id;

-- Ensure at most one planned expense per subscription per monthly plan.
CREATE UNIQUE INDEX "PlannedExpense_subscriptionId_monthlyPlanId_key"
ON "PlannedExpense"("subscriptionId", "monthlyPlanId");
