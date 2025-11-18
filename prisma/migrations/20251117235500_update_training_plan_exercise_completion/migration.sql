-- AlterTable: Cambiar de isCompleted/weekNumber a completionCount/completedDates

-- Eliminar índice antiguo
DROP INDEX IF EXISTS "TrainingPlanExercise_planId_isCompleted_idx";

-- Eliminar columnas antiguas y agregar nuevas
ALTER TABLE "TrainingPlanExercise" DROP COLUMN IF EXISTS "weekNumber";
ALTER TABLE "TrainingPlanExercise" DROP COLUMN IF EXISTS "isCompleted";
ALTER TABLE "TrainingPlanExercise" DROP COLUMN IF EXISTS "completedAt";

ALTER TABLE "TrainingPlanExercise" ADD COLUMN "completionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingPlanExercise" ADD COLUMN "completedDates" TIMESTAMP(3)[];

-- Crear nuevo índice
CREATE INDEX "TrainingPlanExercise_planId_completionCount_idx" ON "TrainingPlanExercise"("planId", "completionCount");
