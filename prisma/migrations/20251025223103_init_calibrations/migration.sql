-- CreateTable
CREATE TABLE "CalibrationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceIdHash" TEXT NOT NULL,
    "sampleRate" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CalibrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationProfile" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "noiseFloorDbfs" DOUBLE PRECISION NOT NULL,
    "rmsTargetMin" DOUBLE PRECISION NOT NULL,
    "rmsTargetMax" DOUBLE PRECISION NOT NULL,
    "clipTolerance" INTEGER NOT NULL,
    "latencyMs" DOUBLE PRECISION NOT NULL,
    "tunerOffsetCents" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalibrationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationMetric" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "avgRmsDb" DOUBLE PRECISION,
    "stdRmsDb" DOUBLE PRECISION,
    "clipRate" DOUBLE PRECISION,
    "snrDb" DOUBLE PRECISION,
    "baseLatencyMs" DOUBLE PRECISION,
    "result" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalibrationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationProfile_sessionId_key" ON "CalibrationProfile"("sessionId");

-- AddForeignKey
ALTER TABLE "CalibrationProfile" ADD CONSTRAINT "CalibrationProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CalibrationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationMetric" ADD CONSTRAINT "CalibrationMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CalibrationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
