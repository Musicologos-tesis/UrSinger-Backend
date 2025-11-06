-- CreateTable
CREATE TABLE "EvaluationSession" (
    "id" TEXT NOT NULL,
    "calibrationId" TEXT NOT NULL,
    "rangeSpanSemitones" DOUBLE PRECISION,
    "rangeMinMidi" DOUBLE PRECISION,
    "rangeMaxMidi" DOUBLE PRECISION,
    "precisionCents" DOUBLE PRECISION,
    "stabilityCents" DOUBLE PRECISION,
    "vibratoRateHz" DOUBLE PRECISION,
    "vibratoDepthCents" DOUBLE PRECISION,
    "meanRmsDb" DOUBLE PRECISION,
    "rmsConsistency" DOUBLE PRECISION,
    "powerIndex" DOUBLE PRECISION,
    "snrDb" DOUBLE PRECISION,
    "rmsDb" DOUBLE PRECISION,
    "recommendedRoute" TEXT,
    "routeConfidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMetric" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "metricsData" JSONB NOT NULL,
    "meanRmsDb" DOUBLE PRECISION,
    "rmsConsistency" DOUBLE PRECISION,
    "durationSeconds" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseMetric_sessionId_exerciseType_idx" ON "ExerciseMetric"("sessionId", "exerciseType");

-- AddForeignKey
ALTER TABLE "ExerciseMetric" ADD CONSTRAINT "ExerciseMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EvaluationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
