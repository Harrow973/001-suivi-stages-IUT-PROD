-- CreateTable
CREATE TABLE "visites_suivi_stage" (
    "id" SERIAL NOT NULL,
    "id_stage" INTEGER NOT NULL,
    "numero_visite" INTEGER NOT NULL DEFAULT 1,
    "date_visite" DATE,
    "donnees_formulaire" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visites_suivi_stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visites_suivi_stage_id_stage_numero_visite_key" ON "visites_suivi_stage"("id_stage", "numero_visite");

-- AddForeignKey
ALTER TABLE "visites_suivi_stage" ADD CONSTRAINT "visites_suivi_stage_id_stage_fkey" FOREIGN KEY ("id_stage") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
