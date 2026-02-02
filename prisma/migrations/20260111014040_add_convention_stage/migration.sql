-- CreateTable
CREATE TABLE "conventions_stage" (
    "id" SERIAL NOT NULL,
    "id_stage" INTEGER,
    "nom_fichier" VARCHAR(255) NOT NULL,
    "chemin_fichier" VARCHAR(500) NOT NULL,
    "taille_fichier" INTEGER NOT NULL,
    "nom_etudiant" VARCHAR(50),
    "prenom_etudiant" VARCHAR(50),
    "nom_entreprise" VARCHAR(100),
    "departement" "Departement" NOT NULL DEFAULT 'INFO',
    "promotion" INTEGER,
    "annee_universitaire" VARCHAR(9),
    "date_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conventions_stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conventions_stage" ADD CONSTRAINT "conventions_stage_id_stage_fkey" FOREIGN KEY ("id_stage") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
