/*
  Warnings:

  - Made the column `simSystem` on table `SpotHole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vereador` on table `SpotHole` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SpotHole" ALTER COLUMN "simSystem" SET NOT NULL,
ALTER COLUMN "vereador" SET NOT NULL;
