-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updetedAt" TIMESTAMP(3) NOT NULL,
    "imgUserPath" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_matricula_key" ON "Users"("matricula");
