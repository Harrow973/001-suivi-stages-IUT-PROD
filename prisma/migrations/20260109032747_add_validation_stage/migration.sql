-- CreateEnum
CREATE TYPE "StatutValidation" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE');

-- CreateTable
CREATE TABLE "validations_stage" (
    "id" SERIAL NOT NULL,
    "id_stage" INTEGER NOT NULL,
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaire" TEXT,
    "fichier_pdf" VARCHAR(255),
    "date_depot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validations_stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "validations_stage" ADD CONSTRAINT "validations_stage_id_stage_fkey" FOREIGN KEY ("id_stage") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
