-- AlterTable
ALTER TABLE "SpotHole" ADD COLUMN     "forceClosedByZone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusBeforeForceClose" TEXT;

-- AlterTable
ALTER TABLE "WorkZone" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedByUserId" TEXT,
ADD COLUMN     "forcedCompletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledStartAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "WorkZone" ADD CONSTRAINT "WorkZone_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
