-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "frequency" INTEGER NOT NULL,
    "focusGroups" INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlanExercise" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "exerciseLevelId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL DEFAULT 1,
    "orderInDay" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingPlan_profileId_status_idx" ON "TrainingPlan"("profileId", "status");

-- CreateIndex
CREATE INDEX "TrainingPlan_evaluationId_idx" ON "TrainingPlan"("evaluationId");

-- CreateIndex
CREATE INDEX "TrainingPlanExercise_planId_dayOfWeek_idx" ON "TrainingPlanExercise"("planId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "TrainingPlanExercise_planId_isCompleted_idx" ON "TrainingPlanExercise"("planId", "isCompleted");

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanExercise" ADD CONSTRAINT "TrainingPlanExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanExercise" ADD CONSTRAINT "TrainingPlanExercise_exerciseLevelId_fkey" FOREIGN KEY ("exerciseLevelId") REFERENCES "ExerciseLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
