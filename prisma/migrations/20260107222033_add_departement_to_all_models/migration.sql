-- CreateEnum
CREATE TYPE "Departement" AS ENUM ('INFO', 'GEA', 'HSE', 'MLT', 'TC');

-- AlterTable
ALTER TABLE "entreprises" ADD COLUMN     "departement" "Departement" NOT NULL DEFAULT 'INFO';

-- AlterTable
ALTER TABLE "etudiants" ADD COLUMN     "departement" "Departement" NOT NULL DEFAULT 'INFO';

-- AlterTable
ALTER TABLE "stages" ADD COLUMN     "departement" "Departement" NOT NULL DEFAULT 'INFO';

-- AlterTable
ALTER TABLE "tuteurs" ADD COLUMN     "departement" "Departement" NOT NULL DEFAULT 'INFO';
