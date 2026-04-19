-- Agregar columna para persistir métricas detalladas por grupo del modelo ML
ALTER TABLE "Evaluation"
ADD COLUMN "groupMetrics" JSONB;