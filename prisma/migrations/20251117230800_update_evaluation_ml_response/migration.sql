-- Actualizar tabla Evaluation para almacenar análisis de debilidades del ML

-- Eliminar columnas antiguas
ALTER TABLE "Evaluation" DROP COLUMN IF EXISTS "recommendedRoute";
ALTER TABLE "Evaluation" DROP COLUMN IF EXISTS "routeConfidence";

-- Agregar nuevas columnas para análisis de debilidades
ALTER TABLE "Evaluation" ADD COLUMN "weaknessesDetected" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Evaluation" ADD COLUMN "totalWeaknesses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Evaluation" ADD COLUMN "confidenceScores" JSONB NOT NULL DEFAULT '{}';
