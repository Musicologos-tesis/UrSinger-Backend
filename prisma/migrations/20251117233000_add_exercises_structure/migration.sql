-- Crear tablas para ejercicios y grupos

CREATE TABLE "ExerciseGroup" (
    "id" SERIAL NOT NULL,
    "groupNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,

    CONSTRAINT "ExerciseGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "exerciseNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseLevel" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT,

    CONSTRAINT "ExerciseLevel_pkey" PRIMARY KEY ("id")
);

-- Índices y constraints
CREATE UNIQUE INDEX "ExerciseGroup_groupNumber_key" ON "ExerciseGroup"("groupNumber");
CREATE INDEX "ExerciseGroup_groupNumber_idx" ON "ExerciseGroup"("groupNumber");

CREATE UNIQUE INDEX "Exercise_groupId_exerciseNumber_key" ON "Exercise"("groupId", "exerciseNumber");
CREATE INDEX "Exercise_groupId_idx" ON "Exercise"("groupId");

CREATE UNIQUE INDEX "ExerciseLevel_exerciseId_level_key" ON "ExerciseLevel"("exerciseId", "level");
CREATE INDEX "ExerciseLevel_exerciseId_idx" ON "ExerciseLevel"("exerciseId");

-- Foreign keys
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExerciseGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseLevel" ADD CONSTRAINT "ExerciseLevel_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
