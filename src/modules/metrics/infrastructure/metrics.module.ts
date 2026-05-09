import { Module } from '@nestjs/common';
import { MetricsController } from './http/metrics.controller';
import { PrismaEvaluationRepository } from './persistence/prisma-evaluation.repository';
import { HttpMLServiceAdapter } from './external/http-ml-service.adapter';
import { EvaluateVocalMetricsUseCase } from '../application/use-cases/evaluate-vocal-metrics.use-case';
import { GetEvaluationUseCase } from '../application/use-cases/get-evaluation.use-case';
import {
  EVALUATION_REPOSITORY,
  IEvaluationRepository,
} from '../domain/repositories/evaluation.repository.interface';
import { ML_SERVICE, IMLService } from '../domain/services/ml.service.interface';

@Module({
  controllers: [MetricsController],
  providers: [
    PrismaEvaluationRepository,
    HttpMLServiceAdapter,
    { provide: EVALUATION_REPOSITORY, useExisting: PrismaEvaluationRepository },
    { provide: ML_SERVICE, useExisting: HttpMLServiceAdapter },
    {
      provide: EvaluateVocalMetricsUseCase,
      useFactory: (evalRepo: IEvaluationRepository, mlService: IMLService) =>
        new EvaluateVocalMetricsUseCase(evalRepo, mlService),
      inject: [EVALUATION_REPOSITORY, ML_SERVICE],
    },
    {
      provide: GetEvaluationUseCase,
      useFactory: (evalRepo: IEvaluationRepository) => new GetEvaluationUseCase(evalRepo),
      inject: [EVALUATION_REPOSITORY],
    },
  ],
  exports: [GetEvaluationUseCase],
})
export class MetricsModule {}
