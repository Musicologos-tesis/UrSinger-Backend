import { Module } from '@nestjs/common';
import { TrainingPlansController } from './http/training-plans.controller';
import { PrismaTrainingPlanRepository } from './persistence/prisma-training-plan.repository';
import { PrismaEvaluationReadRepository } from './persistence/prisma-evaluation-read.repository';
import { PrismaExerciseReadRepository } from './persistence/prisma-exercise-read.repository';
import { GenerateWeeklyPlanUseCase } from '../application/use-cases/generate-weekly-plan.use-case';
import { GetActivePlanUseCase } from '../application/use-cases/get-active-plan.use-case';
import { CompleteExerciseUseCase } from '../application/use-cases/complete-exercise.use-case';
import { GetPlanProgressUseCase } from '../application/use-cases/get-plan-progress.use-case';
import { GetPlanExerciseUseCase } from '../application/use-cases/get-plan-exercise.use-case';
import {
  TRAINING_PLAN_REPOSITORY,
  ITrainingPlanRepository,
} from '../domain/repositories/training-plan.repository.interface';
import {
  EVALUATION_READ_REPOSITORY,
  IEvaluationReadRepository,
} from '../domain/repositories/evaluation-read.repository.interface';
import {
  EXERCISE_READ_REPOSITORY,
  IExerciseReadRepository,
} from '../domain/repositories/exercise-read.repository.interface';

@Module({
  controllers: [TrainingPlansController],
  providers: [
    PrismaTrainingPlanRepository,
    PrismaEvaluationReadRepository,
    PrismaExerciseReadRepository,
    { provide: TRAINING_PLAN_REPOSITORY, useExisting: PrismaTrainingPlanRepository },
    { provide: EVALUATION_READ_REPOSITORY, useExisting: PrismaEvaluationReadRepository },
    { provide: EXERCISE_READ_REPOSITORY, useExisting: PrismaExerciseReadRepository },
    {
      provide: GenerateWeeklyPlanUseCase,
      useFactory: (
        planRepo: ITrainingPlanRepository,
        evalRepo: IEvaluationReadRepository,
        exerciseRepo: IExerciseReadRepository,
      ) => new GenerateWeeklyPlanUseCase(planRepo, evalRepo, exerciseRepo),
      inject: [TRAINING_PLAN_REPOSITORY, EVALUATION_READ_REPOSITORY, EXERCISE_READ_REPOSITORY],
    },
    {
      provide: GetActivePlanUseCase,
      useFactory: (repo: ITrainingPlanRepository) => new GetActivePlanUseCase(repo),
      inject: [TRAINING_PLAN_REPOSITORY],
    },
    {
      provide: CompleteExerciseUseCase,
      useFactory: (repo: ITrainingPlanRepository) => new CompleteExerciseUseCase(repo),
      inject: [TRAINING_PLAN_REPOSITORY],
    },
    {
      provide: GetPlanProgressUseCase,
      useFactory: (repo: ITrainingPlanRepository) => new GetPlanProgressUseCase(repo),
      inject: [TRAINING_PLAN_REPOSITORY],
    },
    {
      provide: GetPlanExerciseUseCase,
      useFactory: (repo: ITrainingPlanRepository) => new GetPlanExerciseUseCase(repo),
      inject: [TRAINING_PLAN_REPOSITORY],
    },
  ],
})
export class TrainingPlansModule {}
