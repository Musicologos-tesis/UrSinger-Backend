import { Module } from '@nestjs/common';
import { ProfileController } from './http/profile.controller';
import { PrismaProfileRepository } from './persistence/prisma-profile.repository';
import { PrismaEvaluationSnapshotRepository } from './persistence/prisma-evaluation-snapshot.repository';
import { GetProfileUseCase } from '../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { GetLatestVocalRangeUseCase } from '../application/use-cases/get-latest-vocal-range.use-case';
import { GetLatestEvaluationSummaryUseCase } from '../application/use-cases/get-latest-evaluation-summary.use-case';
import {
  PROFILE_REPOSITORY,
  IProfileRepository,
} from '../domain/repositories/profile.repository.interface';
import {
  EVALUATION_SNAPSHOT_REPOSITORY,
  IEvaluationSnapshotRepository,
} from '../domain/repositories/evaluation-snapshot.repository.interface';

@Module({
  controllers: [ProfileController],
  providers: [
    PrismaProfileRepository,
    PrismaEvaluationSnapshotRepository,
    { provide: PROFILE_REPOSITORY, useExisting: PrismaProfileRepository },
    { provide: EVALUATION_SNAPSHOT_REPOSITORY, useExisting: PrismaEvaluationSnapshotRepository },
    {
      provide: GetProfileUseCase,
      useFactory: (repo: IProfileRepository) => new GetProfileUseCase(repo),
      inject: [PROFILE_REPOSITORY],
    },
    {
      provide: UpdateProfileUseCase,
      useFactory: (repo: IProfileRepository) => new UpdateProfileUseCase(repo),
      inject: [PROFILE_REPOSITORY],
    },
    {
      provide: GetLatestVocalRangeUseCase,
      useFactory: (profileRepo: IProfileRepository, evalRepo: IEvaluationSnapshotRepository) =>
        new GetLatestVocalRangeUseCase(profileRepo, evalRepo),
      inject: [PROFILE_REPOSITORY, EVALUATION_SNAPSHOT_REPOSITORY],
    },
    {
      provide: GetLatestEvaluationSummaryUseCase,
      useFactory: (profileRepo: IProfileRepository, evalRepo: IEvaluationSnapshotRepository) =>
        new GetLatestEvaluationSummaryUseCase(profileRepo, evalRepo),
      inject: [PROFILE_REPOSITORY, EVALUATION_SNAPSHOT_REPOSITORY],
    },
  ],
})
export class ProfileModule {}
