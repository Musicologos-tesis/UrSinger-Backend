import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { EvaluationMetricsDto } from './dto/evaluation-metrics.dto';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluar métricas y detectar debilidades vocales (ML)' })
  @ApiResponse({ status: 201, description: 'Evaluación completada y debilidades detectadas' })
  @ApiResponse({ status: 404, description: 'Calibración o perfil no encontrado' })
  @ApiResponse({ status: 503, description: 'Servicio ML no disponible' })
  async evaluate(@Body() dto: EvaluationMetricsDto) {
    return this.metricsService.predictVocalRoute(dto);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Obtener evaluación por sessionId' })
  @ApiResponse({ status: 200, description: 'Evaluación encontrada' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async getEvaluation(@Param('sessionId') sessionId: string) {
    return this.metricsService.getEvaluation(sessionId);
  }
}

