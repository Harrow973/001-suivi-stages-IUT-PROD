/*
  Warnings:

  - You are about to drop the `validations_stage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "validations_stage" DROP CONSTRAINT "validations_stage_id_stage_fkey";

-- DropTable
DROP TABLE "validations_stage";

-- DropEnum
DROP TYPE "StatutValidation";

-- CreateTable
CREATE TABLE "referents_stage" (
    "id" SERIAL NOT NULL,
    "departement" "Departement" NOT NULL DEFAULT 'INFO',
    "promotion" INTEGER NOT NULL,
    "annee_universitaire" VARCHAR(9) NOT NULL,
    "id_tuteur" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referents_stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referents_stage_departement_promotion_annee_universitaire_key" ON "referents_stage"("departement", "promotion", "annee_universitaire");

-- AddForeignKey
ALTER TABLE "referents_stage" ADD CONSTRAINT "referents_stage_id_tuteur_fkey" FOREIGN KEY ("id_tuteur") REFERENCES "tuteurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
