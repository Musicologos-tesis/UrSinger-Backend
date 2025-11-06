import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { RangeMetricsDto } from './dto/range-metrics.dto';
import { StabilityMetricsDto } from './dto/stability-metrics.dto';
import { FinalizeMetricsDto } from './dto/finalize-metrics.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('range')
  async submitRange(@Body() dto: RangeMetricsDto) {
    return this.metricsService.submitRange(dto);
  }

  @Post('stability')
  async submitStability(@Body() dto: StabilityMetricsDto) {
    return this.metricsService.submitStability(dto);
  }

  @Post('finalize')
  async finalize(@Body() dto: FinalizeMetricsDto) {
    return this.metricsService.finalize(dto);
  }

  @Get(':sessionId')
  async getConsolidated(@Param('sessionId') sessionId: string) {
    return this.metricsService.getConsolidated(sessionId);
  }
}
