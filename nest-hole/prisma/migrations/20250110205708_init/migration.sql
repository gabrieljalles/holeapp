-- CreateTable
CREATE TABLE "SpotHole" (
    "id" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "fixedBy" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imgBeforeWork" TEXT NOT NULL,
    "imgAfterWork" TEXT NOT NULL,

    CONSTRAINT "SpotHole_pkey" PRIMARY KEY ("id")
);
