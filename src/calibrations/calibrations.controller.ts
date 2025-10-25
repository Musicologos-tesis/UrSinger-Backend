import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CalibrationsService } from './calibrations.service';
import { StartCalibrationDto } from './dto/start-calibration.dto';
import { FinishCalibrationDto } from './dto/finish-calibration.dto';

@Controller('calibrations')
export class CalibrationsController {
  constructor(private readonly svc: CalibrationsService) {}

  @Post('start')
  async start(@Body() dto: StartCalibrationDto) {
    return this.svc.start(dto);
  }

  @Post('finish')
  async finish(@Body() dto: FinishCalibrationDto) {
    return this.svc.finish(dto);
  }

  @Get('latest')
  async latest(@Query('deviceIdHash') deviceIdHash: string) {
    return this.svc.latest(deviceIdHash);
  }

  @Get(':sessionId/metrics')
  async metrics(@Param('sessionId') sessionId: string) {
    return this.svc.metrics(sessionId);
  }
}
