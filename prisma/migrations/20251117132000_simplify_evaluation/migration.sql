-- Eliminar tablas antiguas
DROP TABLE IF EXISTS "ExerciseMetric" CASCADE;
DROP TABLE IF EXISTS "EvaluationSession" CASCADE;

-- Crear tabla Evaluation simplificada
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    
    -- Métricas de volumen
    "meanRmsDb" DOUBLE PRECISION NOT NULL,
    "rmsConsistency" DOUBLE PRECISION NOT NULL,
    "dynamicRangeDb" DOUBLE PRECISION NOT NULL,
    "durationSec" DOUBLE PRECISION NOT NULL,
    
    -- Métricas de afinación
    "precisionCents" DOUBLE PRECISION NOT NULL,
    "stabilityCents" DOUBLE PRECISION NOT NULL,
    
    -- Métricas de rango vocal
    "rangeMinMidi" DOUBLE PRECISION NOT NULL,
    "rangeMaxMidi" DOUBLE PRECISION NOT NULL,
    "rangeSpanSemitones" DOUBLE PRECISION NOT NULL,
    "attackLatencyMs" DOUBLE PRECISION NOT NULL,
    
    -- Predicción ML
    "recommendedRoute" TEXT,
    "routeConfidence" DOUBLE PRECISION,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- Índices
CREATE UNIQUE INDEX "Evaluation_sessionId_key" ON "Evaluation"("sessionId");
CREATE INDEX "Evaluation_profileId_idx" ON "Evaluation"("profileId");
CREATE INDEX "Evaluation_sessionId_idx" ON "Evaluation"("sessionId");

-- Foreign key
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
