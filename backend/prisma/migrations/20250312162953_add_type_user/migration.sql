/*
  Warnings:

  - Added the required column `typeUser` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "typeUser" TEXT NOT NULL;
