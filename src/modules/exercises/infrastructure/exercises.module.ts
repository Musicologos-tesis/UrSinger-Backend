import { Module } from '@nestjs/common';
import { ExercisesController } from './http/exercises.controller';
import { PrismaExerciseCatalogRepository } from './persistence/prisma-exercise-catalog.repository';
import { GetExerciseCatalogUseCase } from '../application/use-cases/get-exercise-catalog.use-case';
import { EXERCISE_CATALOG_REPOSITORY, IExerciseCatalogRepository } from '../domain/repositories/exercise-catalog.repository.interface';

@Module({
  controllers: [ExercisesController],
  providers: [
    PrismaExerciseCatalogRepository,
    { provide: EXERCISE_CATALOG_REPOSITORY, useExisting: PrismaExerciseCatalogRepository },
    {
      provide: GetExerciseCatalogUseCase,
      useFactory: (repo: IExerciseCatalogRepository) => new GetExerciseCatalogUseCase(repo),
      inject: [EXERCISE_CATALOG_REPOSITORY],
    },
  ],
})
export class ExercisesModule {}
