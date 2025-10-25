import { Module } from '@nestjs/common';
import { CalibrationsController } from './calibrations.controller';
import { CalibrationsService } from './calibrations.service';
import { CalibrationsGateway } from './calibrations.gateway';

@Module({
  controllers: [CalibrationsController],
  providers: [CalibrationsService, CalibrationsGateway],
  exports: [CalibrationsService],
})
export class CalibrationsModule {}