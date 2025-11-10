-- CreateTable
CREATE TABLE "VocalTechnique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocalTechnique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocalLesson" (
    "id" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "prerequisites" TEXT[],
    "techniqueMode" TEXT NOT NULL,
    "pitchRange" JSONB NOT NULL,
    "dynamicRange" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocalLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocalExercise" (
    "id" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "pitchRange" JSONB NOT NULL,
    "dynamicRange" JSONB NOT NULL,
    "targetMetrics" JSONB NOT NULL,
    "audioUrl" TEXT,
    "sheetMusic" TEXT,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocalExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "techniqueId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metrics" JSONB,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "pitchAccuracy" DOUBLE PRECISION,
    "stability" DOUBLE PRECISION,
    "vibratoRate" DOUBLE PRECISION,
    "vibratoDepth" DOUBLE PRECISION,
    "dynamicControl" DOUBLE PRECISION,
    "techniqueScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VocalTechnique_name_key" ON "VocalTechnique"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VocalLesson_techniqueId_orderIndex_key" ON "VocalLesson"("techniqueId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LessonExercise_lessonId_orderIndex_key" ON "LessonExercise"("lessonId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_userId_lessonId_key" ON "StudentProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_exerciseId_idx" ON "ExerciseAttempt"("userId", "exerciseId");

-- AddForeignKey
ALTER TABLE "VocalLesson" ADD CONSTRAINT "VocalLesson_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "VocalTechnique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocalExercise" ADD CONSTRAINT "VocalExercise_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "VocalTechnique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "VocalLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExercise" ADD CONSTRAINT "LessonExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "VocalExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "VocalTechnique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "VocalLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "VocalExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "StudentProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
