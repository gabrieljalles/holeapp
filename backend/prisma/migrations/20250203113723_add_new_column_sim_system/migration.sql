/*
  Warnings:

  - You are about to drop the column `Vereador` on the `SpotHole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SpotHole" DROP COLUMN "Vereador",
ADD COLUMN     "simSystem" BOOLEAN,
ADD COLUMN     "vereador" BOOLEAN;
