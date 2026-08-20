-- Data step first, while the "Role" enum still has the MANAGER value: any existing
-- MANAGER account becomes ADMIN before we narrow the enum (see conversation decision).
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" = 'MANAGER';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('VIEWER', 'ADDER', 'REPAIRER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembership" DROP CONSTRAINT "TeamMembership_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembership" DROP CONSTRAINT "TeamMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkZone" DROP CONSTRAINT "WorkZone_teamId_fkey";

-- AlterTable
ALTER TABLE "WorkZone" DROP COLUMN "teamId",
ADD COLUMN     "polygon" JSONB;

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMembership";

-- CreateTable
CREATE TABLE "WorkZoneAssignment" (
    "id" TEXT NOT NULL,
    "workZoneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkZoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkZoneAssignment_workZoneId_userId_key" ON "WorkZoneAssignment"("workZoneId", "userId");

-- AddForeignKey
ALTER TABLE "WorkZoneAssignment" ADD CONSTRAINT "WorkZoneAssignment_workZoneId_fkey" FOREIGN KEY ("workZoneId") REFERENCES "WorkZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkZoneAssignment" ADD CONSTRAINT "WorkZoneAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
