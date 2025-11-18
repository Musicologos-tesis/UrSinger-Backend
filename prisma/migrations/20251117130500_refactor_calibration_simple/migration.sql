-- DropTable (eliminar tablas antiguas)
DROP TABLE IF EXISTS "CalibrationMetric" CASCADE;
DROP TABLE IF EXISTS "CalibrationProfile" CASCADE;
DROP TABLE IF EXISTS "CalibrationSession" CASCADE;

-- CreateTable Calibration (nueva tabla simplificada)
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

-- AlterTable EvaluationSession (agregar noiseFloorDbfs, quitar rmsDb)
ALTER TABLE "EvaluationSession" 
ADD COLUMN "noiseFloorDbfs" DOUBLE PRECISION,
DROP COLUMN IF EXISTS "rmsDb";

-- CreateIndex
CREATE UNIQUE INDEX "Calibration_sessionId_key" ON "Calibration"("sessionId");
CREATE INDEX "Calibration_profileId_isCurrent_idx" ON "Calibration"("profileId", "isCurrent");
CREATE INDEX "Calibration_sessionId_idx" ON "Calibration"("sessionId");

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
