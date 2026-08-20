-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'ADDER', 'REPAIRER', 'MANAGER', 'ADMIN');

-- AlterTable: add role with a temporary default, backfill from userType, then drop userType
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'VIEWER';

UPDATE "User" SET "role" = CASE "userType"
  WHEN 'admin' THEN 'ADMIN'::"Role"
  WHEN 'reparador' THEN 'REPAIRER'::"Role"
  WHEN 'motoboy' THEN 'ADDER'::"Role"
  ELSE 'VIEWER'::"Role"
END;

ALTER TABLE "User" DROP COLUMN "userType";

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_userId_key" ON "TeamMembership"("teamId", "userId");

-- AlterTable: SpotHole loses the free-text createdBy/fixedBy strings, gains real FKs + zone FK
-- (existing 1771 non-null createdBy/fixedBy string values are intentionally discarded — see plan decision #7,
-- there is no reliable mapping from old free-text creator names to real User accounts)
ALTER TABLE "SpotHole" DROP COLUMN "createdBy",
DROP COLUMN "fixedBy",
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "fixedByUserId" TEXT,
ADD COLUMN     "workZoneId" TEXT;

-- CreateIndex
CREATE INDEX "SpotHole_workZoneId_idx" ON "SpotHole"("workZoneId");

-- AddForeignKey
ALTER TABLE "SpotHole" ADD CONSTRAINT "SpotHole_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotHole" ADD CONSTRAINT "SpotHole_fixedByUserId_fkey" FOREIGN KEY ("fixedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotHole" ADD CONSTRAINT "SpotHole_workZoneId_fkey" FOREIGN KEY ("workZoneId") REFERENCES "WorkZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkZone" ADD CONSTRAINT "WorkZone_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
