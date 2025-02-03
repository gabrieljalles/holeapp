/*
  Warnings:

  - You are about to drop the column `imgAfterWork` on the `SpotHole` table. All the data in the column will be lost.
  - You are about to drop the column `imgBeforeWork` on the `SpotHole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SpotHole" DROP COLUMN "imgAfterWork",
DROP COLUMN "imgBeforeWork",
ADD COLUMN     "Vereador" BOOLEAN,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "fixedAt" TIMESTAMP(3),
ADD COLUMN     "imgAfterWorkPath" TEXT,
ADD COLUMN     "imgBeforeWorkPath" TEXT,
ADD COLUMN     "trafficIntensity" TEXT,
ALTER COLUMN "priority" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "zone" DROP NOT NULL,
ALTER COLUMN "cep" DROP NOT NULL,
ALTER COLUMN "createdBy" DROP NOT NULL,
ALTER COLUMN "fixedBy" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "number" DROP NOT NULL,
ALTER COLUMN "observation" DROP NOT NULL;
