-- AlterTable
-- Supprimer la contrainte de clé étrangère
ALTER TABLE "etudiants" DROP CONSTRAINT IF EXISTS "etudiants_id_tuteur_fkey";

-- AlterTable
-- Supprimer la colonne id_tuteur
ALTER TABLE "etudiants" DROP COLUMN IF EXISTS "id_tuteur";

