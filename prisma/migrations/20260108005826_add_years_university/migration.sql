/*
  Warnings:

  - You are about to drop the column `annee_universitaire` on the `etudiants` table. All the data in the column will be lost.
  - You are about to drop the column `annee_universitaire` on the `stages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etudiants" DROP COLUMN "annee_universitaire",
ADD COLUMN     "anneeUniversitaire" VARCHAR(9);

-- AlterTable
ALTER TABLE "stages" DROP COLUMN "annee_universitaire",
ADD COLUMN     "anneeUniversitaire" VARCHAR(9);
