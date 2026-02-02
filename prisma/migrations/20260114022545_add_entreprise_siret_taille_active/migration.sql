-- CreateEnum
CREATE TYPE "TailleEntreprise" AS ENUM ('TPE', 'PME', 'ETI', 'GE');

-- AlterTable
ALTER TABLE "entreprises" ADD COLUMN "siret" VARCHAR(14),
ADD COLUMN "taille_entreprise" "TailleEntreprise",
ADD COLUMN "est_active" BOOLEAN NOT NULL DEFAULT true;

