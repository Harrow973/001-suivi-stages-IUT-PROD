-- CreateEnum
CREATE TYPE "StatutStage" AS ENUM ('ACTIF', 'TERMINE', 'ANNULE');

-- AlterTable
ALTER TABLE "stages" ADD COLUMN     "statut" "StatutStage" NOT NULL DEFAULT 'ACTIF';
