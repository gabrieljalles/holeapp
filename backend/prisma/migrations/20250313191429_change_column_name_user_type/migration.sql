/*
  Warnings:

  - You are about to drop the column `typeUser` on the `User` table. All the data in the column will be lost.
  - Added the required column `userType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "typeUser",
ADD COLUMN     "userType" TEXT NOT NULL;
