import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EvaluationMetricsDto } from './dto/evaluation-metrics.dto';

@Injectable()
export class MetricsService {
  private readonly ML_SERVICE_URL: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.ML_SERVICE_URL = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  private getWeaknessesFromGroupMetrics(groupMetrics: Record<string, unknown>): string[] {
    return Object.entries(groupMetrics)
      .filter(([, metric]) => {
        if (!metric || typeof metric !== 'object') {
          return false;
        }

        const isWeak = (metric as { is_weak?: boolean }).is_weak;
        return isWeak === true;
      })
      .map(([group]) => `weak_${group}`);
  }

  /**
   * Recibe métricas completas del frontend y consulta el modelo ML
   */
  async predictVocalRoute(dto: EvaluationMetricsDto) {
    // Verificar que la calibración existe
    const calibration = await this.prisma.calibration.findUnique({
      where: { sessionId: dto.sessionId },
    });

    if (!calibration) {
      throw new NotFoundException(`Calibration ${dto.sessionId} not found`);
    }

    // Verificar que el perfil existe
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: dto.profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${dto.profileId} not found`);
    }

    try {
      // Verificar salud del servicio ML
      const healthResponse = await fetch(`${this.ML_SERVICE_URL}/health`);
      if (!healthResponse.ok) {
        throw new HttpException('ML service is not available', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Preparar payload para el modelo ML
      const mlPayload = {
        gender: dto.gender,
        meanRmsDb: dto.meanRmsDb,
        rmsConsistency: dto.rmsConsistency,
        dynamicRangeDb: dto.dynamicRangeDb,
        durationSec: dto.durationSec,
        precisionCents: dto.precisionCents,
        stabilityCents: dto.stabilityCents,
        rangeMinMidi: dto.rangeMinMidi,
        rangeMaxMidi: dto.rangeMaxMidi,
        rangeSpanSemitones: dto.rangeSpanSemitones,
        attackLatencyMs: dto.attackLatencyMs,
      };

      // Llamar al endpoint de predicción
      const predictResponse = await fetch(`${this.ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as any,
        body: JSON.stringify(mlPayload),
      });

      if (!predictResponse.ok) {
        const errorData = await predictResponse.json();
        throw new HttpException(
          `ML prediction failed: ${errorData.message || 'Unknown error'}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const prediction = await predictResponse.json();

      // Log para debugging
      console.log('ML Service Response:', JSON.stringify(prediction, null, 2));

      // Interpretar respuesta del ML (estructura nueva + compatibilidad)
      const groupMetrics =
        prediction.group_metrics && typeof prediction.group_metrics === 'object'
          ? (prediction.group_metrics as Record<string, any>)
          : {};

      const confidenceScores =
        prediction.confidence_scores && typeof prediction.confidence_scores === 'object'
          ? prediction.confidence_scores
          : {};

      const weaknessesDetected =
        Array.isArray(prediction.weaknesses_detected) && prediction.weaknesses_detected.length > 0
          ? prediction.weaknesses_detected
          : this.getWeaknessesFromGroupMetrics(groupMetrics);

      const totalWeaknesses =
        typeof prediction.total_weaknesses === 'number'
          ? prediction.total_weaknesses
          : weaknessesDetected.length;

      // Guardar la evaluación en la base de datos (upsert si ya existe)
      const evaluation = await this.prisma.evaluation.upsert({
        where: { sessionId: dto.sessionId },
        update: {
          // Métricas de volumen
          meanRmsDb: dto.meanRmsDb,
          rmsConsistency: dto.rmsConsistency,
          dynamicRangeDb: dto.dynamicRangeDb,
          durationSec: dto.durationSec,

          // Métricas de afinación
          precisionCents: dto.precisionCents,
          stabilityCents: dto.stabilityCents,

          // Métricas de rango
          rangeMinMidi: dto.rangeMinMidi,
          rangeMaxMidi: dto.rangeMaxMidi,
          rangeSpanSemitones: dto.rangeSpanSemitones,
          attackLatencyMs: dto.attackLatencyMs,

          // Análisis del modelo ML
          weaknessesDetected,
          totalWeaknesses,
          confidenceScores,
          groupMetrics,
        } as any,
        create: {
          profileId: dto.profileId,
          sessionId: dto.sessionId,

          // Métricas de volumen
          meanRmsDb: dto.meanRmsDb,
          rmsConsistency: dto.rmsConsistency,
          dynamicRangeDb: dto.dynamicRangeDb,
          durationSec: dto.durationSec,

          // Métricas de afinación
          precisionCents: dto.precisionCents,
          stabilityCents: dto.stabilityCents,

          // Métricas de rango
          rangeMinMidi: dto.rangeMinMidi,
          rangeMaxMidi: dto.rangeMaxMidi,
          rangeSpanSemitones: dto.rangeSpanSemitones,
          attackLatencyMs: dto.attackLatencyMs,

          // Análisis del modelo ML
          weaknessesDetected,
          totalWeaknesses,
          confidenceScores,
          groupMetrics,
        } as any,
      });

      // Formatear grupos para respuesta amigable
      const weaknessGroups = weaknessesDetected.map((w: string) => w.replace('weak_', ''));

      return {
        success: true,
        sessionId: dto.sessionId,
        profileId: dto.profileId,
        weaknessAnalysis: {
          groups: weaknessGroups,
          total: totalWeaknesses,
          message:
            totalWeaknesses > 0
              ? `Se detectaron carencias en los grupos: ${weaknessGroups.join(', ')}`
              : 'No se detectaron carencias significativas',
          confidence: confidenceScores,
          groupMetrics,
        },
        createdAt: evaluation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);

      throw new HttpException(
        `Failed to connect to ML service: ${errorMessage}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Obtiene una evaluación por sessionId
   */
  async getEvaluation(sessionId: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { sessionId },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation ${sessionId} not found`);
    }

    return evaluation;
  }
}
