/*
  Warnings:

  - Added the required column `bigHole` to the `SpotHole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpotHole" ADD COLUMN     "bigHole" BOOLEAN NOT NULL;
