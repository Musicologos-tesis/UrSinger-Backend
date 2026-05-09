import { Module } from '@nestjs/common';
import { CalibrationsController } from './http/calibrations.controller';
import { PrismaCalibrationRepository } from './persistence/prisma-calibration.repository';
import { CreateCalibrationUseCase } from '../application/use-cases/create-calibration.use-case';
import { GetCurrentCalibrationUseCase } from '../application/use-cases/get-current-calibration.use-case';
import { GetAllCalibrationsUseCase } from '../application/use-cases/get-all-calibrations.use-case';
import { GetCalibrationBySessionUseCase } from '../application/use-cases/get-calibration-by-session.use-case';
import { SetCurrentCalibrationUseCase } from '../application/use-cases/set-current-calibration.use-case';
import { CALIBRATION_REPOSITORY, ICalibrationRepository } from '../domain/repositories/calibration.repository.interface';

@Module({
  controllers: [CalibrationsController],
  providers: [
    PrismaCalibrationRepository,
    { provide: CALIBRATION_REPOSITORY, useExisting: PrismaCalibrationRepository },
    {
      provide: CreateCalibrationUseCase,
      useFactory: (repo: ICalibrationRepository) => new CreateCalibrationUseCase(repo),
      inject: [CALIBRATION_REPOSITORY],
    },
    {
      provide: GetCurrentCalibrationUseCase,
      useFactory: (repo: ICalibrationRepository) => new GetCurrentCalibrationUseCase(repo),
      inject: [CALIBRATION_REPOSITORY],
    },
    {
      provide: GetAllCalibrationsUseCase,
      useFactory: (repo: ICalibrationRepository) => new GetAllCalibrationsUseCase(repo),
      inject: [CALIBRATION_REPOSITORY],
    },
    {
      provide: GetCalibrationBySessionUseCase,
      useFactory: (repo: ICalibrationRepository) => new GetCalibrationBySessionUseCase(repo),
      inject: [CALIBRATION_REPOSITORY],
    },
    {
      provide: SetCurrentCalibrationUseCase,
      useFactory: (repo: ICalibrationRepository) => new SetCurrentCalibrationUseCase(repo),
      inject: [CALIBRATION_REPOSITORY],
    },
  ],
  exports: [GetCalibrationBySessionUseCase],
})
export class CalibrationsModule {}
