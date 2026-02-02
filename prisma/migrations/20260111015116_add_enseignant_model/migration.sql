-- CreateTable
CREATE TABLE "enseignants" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20),
    "email" VARCHAR(100),
    "departement" "Departement" NOT NULL DEFAULT 'INFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enseignants_pkey" PRIMARY KEY ("id")
);

-- Étape 1: Ajouter la colonne id_enseignant comme nullable temporairement
ALTER TABLE "referents_stage" ADD COLUMN "id_enseignant" INTEGER;

-- Étape 2: Migrer les données - créer des enseignants à partir des tuteurs référents
-- et mettre à jour les référents
-- On utilise DISTINCT ON pour éviter les doublons
INSERT INTO "enseignants" ("nom", "prenom", "telephone", "email", "departement", "created_at", "updated_at")
SELECT DISTINCT ON (t.nom, t.prenom, t.departement)
    t.nom,
    t.prenom,
    t.telephone,
    t.email,
    t.departement,
    NOW(),
    NOW()
FROM "referents_stage" rs
INNER JOIN "tuteurs" t ON rs."id_tuteur" = t."id"
WHERE rs."id_tuteur" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "enseignants" e 
    WHERE e.nom = t.nom 
      AND e.prenom = t.prenom 
      AND e.departement = t.departement
  );

-- Étape 3: Mettre à jour les référents avec les IDs des enseignants correspondants
UPDATE "referents_stage" rs
SET "id_enseignant" = e."id"
FROM "tuteurs" t
INNER JOIN "enseignants" e ON 
    t."nom" = e."nom" AND 
    t."prenom" = e."prenom" AND 
    t."departement" = e."departement"
WHERE rs."id_tuteur" = t."id"
  AND rs."id_enseignant" IS NULL;

-- Étape 4: Rendre id_enseignant NOT NULL (après migration des données)
ALTER TABLE "referents_stage"
ALTER COLUMN "id_enseignant"
SET
    NOT NULL;

-- Étape 5: Supprimer l'ancienne contrainte et colonne
ALTER TABLE "referents_stage"
DROP CONSTRAINT IF EXISTS "referents_stage_id_tuteur_fkey";

ALTER TABLE "referents_stage" DROP COLUMN "id_tuteur";

-- Étape 6: Ajouter la nouvelle contrainte de clé étrangère
ALTER TABLE "referents_stage"
ADD CONSTRAINT "referents_stage_id_enseignant_fkey" FOREIGN KEY ("id_enseignant") REFERENCES "enseignants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;