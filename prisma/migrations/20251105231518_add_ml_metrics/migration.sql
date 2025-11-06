-- AlterTable
ALTER TABLE "EvaluationSession" ADD COLUMN     "dynamicRangeDb" DOUBLE PRECISION,
ADD COLUMN     "registerShifts" INTEGER,
ADD COLUMN     "spectralCentroid" DOUBLE PRECISION,
ADD COLUMN     "tessituraCenterMidi" DOUBLE PRECISION,
ADD COLUMN     "voiceType" TEXT;
