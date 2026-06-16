-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "DarkThemeVariant" AS ENUM ('BLUE', 'BLACK');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "darkThemeVariant" "DarkThemeVariant" NOT NULL DEFAULT 'BLUE';
