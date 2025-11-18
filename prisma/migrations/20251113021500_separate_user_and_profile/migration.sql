-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "weeklyTrainingFreq" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- Migrar datos existentes de User a UserProfile
INSERT INTO "UserProfile" ("id", "userId", "name", "age", "gender", "weeklyTrainingFreq", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    "name",
    "age",
    "gender",
    "weeklyTrainingFreq",
    "createdAt",
    "updatedAt"
FROM "User"
WHERE "name" IS NOT NULL;

-- AlterTable: Eliminar columnas de User que se movieron a UserProfile
ALTER TABLE "User" DROP COLUMN "age",
DROP COLUMN "gender",
DROP COLUMN "name",
DROP COLUMN "weeklyTrainingFreq";

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
