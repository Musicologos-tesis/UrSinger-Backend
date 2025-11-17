/*
  Warnings:

  - You are about to drop the column `rmsDb` on the `EvaluationSession` table. All the data in the column will be lost.
  - You are about to drop the `CalibrationMetric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CalibrationProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CalibrationSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CalibrationMetric" DROP CONSTRAINT "CalibrationMetric_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CalibrationProfile" DROP CONSTRAINT "CalibrationProfile_sessionId_fkey";

-- AlterTable
ALTER TABLE "EvaluationSession" DROP COLUMN "rmsDb",
ADD COLUMN     "noiseFloorDbfs" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."CalibrationMetric";

-- DropTable
DROP TABLE "public"."CalibrationProfile";

-- DropTable
DROP TABLE "public"."CalibrationSession";

-- CreateTable
CREATE TABLE "Calibration" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "deviceIdHash" TEXT NOT NULL,
    "sampleRate" INTEGER NOT NULL,
    "noiseFloorDbfs" DOUBLE PRECISION NOT NULL,
    "snrDb" DOUBLE PRECISION,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calibration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calibration_sessionId_key" ON "Calibration"("sessionId");

-- CreateIndex
CREATE INDEX "Calibration_profileId_isCurrent_idx" ON "Calibration"("profileId", "isCurrent");

-- CreateIndex
CREATE INDEX "Calibration_sessionId_idx" ON "Calibration"("sessionId");

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
