-- CreateTable
CREATE TABLE "entreprises" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "adresse" TEXT,
    "secteur" VARCHAR(50),
    "telephone" VARCHAR(20),
    "email" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100),
    "id_tuteur" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuteurs" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20),
    "email" VARCHAR(100),
    "id_entreprise" INTEGER,
    "etudiants_actuels" TEXT,
    "etudiants_historique" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tuteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" SERIAL NOT NULL,
    "sujet" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "id_entreprise" INTEGER,
    "id_etudiant" INTEGER,
    "id_tuteur" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_tuteur_fkey" FOREIGN KEY ("id_tuteur") REFERENCES "tuteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tuteurs" ADD CONSTRAINT "tuteurs_id_entreprise_fkey" FOREIGN KEY ("id_entreprise") REFERENCES "entreprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_entreprise_fkey" FOREIGN KEY ("id_entreprise") REFERENCES "entreprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_tuteur_fkey" FOREIGN KEY ("id_tuteur") REFERENCES "tuteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
