import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EvaluationMetricsDto } from './dto/evaluation-metrics.dto';
import {
  EvaluateVocalMetricsUseCase,
  EvaluateVocalMetricsCommand,
} from '../../application/use-cases/evaluate-vocal-metrics.use-case';
import { GetEvaluationUseCase } from '../../application/use-cases/get-evaluation.use-case';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { EvaluationNotFoundException } from '../../domain/exceptions/evaluation-not-found.exception';
import { MLServiceUnavailableException } from '../../domain/exceptions/ml-service-unavailable.exception';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly evaluateUseCase: EvaluateVocalMetricsUseCase,
    private readonly getEvaluationUseCase: GetEvaluationUseCase,
  ) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluar métricas y detectar debilidades vocales (ML)' })
  @ApiResponse({ status: 201, description: 'Evaluación completada' })
  @ApiResponse({ status: 404, description: 'Calibración o perfil no encontrado' })
  @ApiResponse({ status: 503, description: 'Servicio ML no disponible' })
  async evaluate(@Body() dto: EvaluationMetricsDto) {
    try {
      return await this.evaluateUseCase.execute(
        new EvaluateVocalMetricsCommand(
          dto.profileId,
          dto.sessionId,
          dto.gender,
          dto.meanRmsDb,
          dto.rmsConsistency,
          dto.dynamicRangeDb,
          dto.durationSec,
          dto.precisionCents,
          dto.stabilityCents,
          dto.rangeMinMidi,
          dto.rangeMaxMidi,
          dto.rangeSpanSemitones,
          dto.attackLatencyMs,
        ),
      );
    } catch (e) {
      if (e instanceof CalibrationNotFoundException || e instanceof ProfileNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof MLServiceUnavailableException)
        throw new ServiceUnavailableException(e.message);
      throw e;
    }
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Obtener evaluación por sessionId' })
  @ApiResponse({ status: 200, description: 'Evaluación encontrada' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async getEvaluation(@Param('sessionId') sessionId: string) {
    try {
      return await this.getEvaluationUseCase.execute(sessionId);
    } catch (e) {
      if (e instanceof EvaluationNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }
}
