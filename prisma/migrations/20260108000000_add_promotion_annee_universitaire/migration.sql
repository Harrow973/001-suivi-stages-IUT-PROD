-- AlterTable
ALTER TABLE "etudiants" ADD COLUMN "promotion" INTEGER DEFAULT 2;
ALTER TABLE "etudiants" ADD COLUMN "annee_universitaire" VARCHAR(9);

-- AlterTable
ALTER TABLE "stages" ADD COLUMN "promotion" INTEGER;
ALTER TABLE "stages" ADD COLUMN "annee_universitaire" VARCHAR(9);

