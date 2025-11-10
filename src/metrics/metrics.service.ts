import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearningService } from '../learning/learning.service';
import { RangeMetricsDto } from './dto/range-metrics.dto';
import { StabilityMetricsDto } from './dto/stability-metrics.dto';
import { FinalizeMetricsDto } from './dto/finalize-metrics.dto';

@Injectable()
export class MetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningService: LearningService,
  ) {}

  private determineRecommendedTechnique(metrics: {
    rangeSpanSemitones?: number;
    precisionCents?: number;
    stabilityCents?: number;
    powerIndex?: number;
    voiceType?: string;
  }): string {
    // TODO: Implementar lógica real de ML
    // Por ahora, una lógica simple basada en las métricas

    // Si tiene buen control de estabilidad y potencia, sugerir CVT
    if (
      metrics.stabilityCents && metrics.stabilityCents < 50 &&
      metrics.powerIndex && metrics.powerIndex > 0.7
    ) {
      return 'CVT';
    }

    // Si tiene buen rango y precisión pero menor potencia, sugerir EVM
    if (
      metrics.rangeSpanSemitones && metrics.rangeSpanSemitones > 24 &&
      metrics.precisionCents && metrics.precisionCents < 30
    ) {
      return 'EVM';
    }

    // Por defecto, empezar con EVM que es más técnico
    return 'EVM';
  }

  /**
   * Registra métricas del ejercicio de RANGO VOCAL
   */
  async submitRange(dto: RangeMetricsDto) {
    // Verificar que existe la sesión de calibración
    const calibrationSession = await this.prisma.calibrationSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!calibrationSession) {
      throw new NotFoundException(`Calibration session ${dto.sessionId} not found`);
    }

    // Crear o verificar que existe la EvaluationSession
    let evalSession = await this.prisma.evaluationSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!evalSession) {
      evalSession = await this.prisma.evaluationSession.create({
        data: {
          id: dto.sessionId,
          calibrationId: dto.sessionId,
          status: 'in_progress',
        },
      });
    }

    // Contar intentos previos de este ejercicio
    const attemptCount = await this.prisma.exerciseMetric.count({
      where: { sessionId: dto.sessionId, exerciseType: 'range' },
    });

    // Crear el registro del ejercicio
    const exercise = await this.prisma.exerciseMetric.create({
      data: {
        sessionId: dto.sessionId,
        exerciseType: 'range',
        attemptNumber: attemptCount + 1,
        metricsData: {
          rangeSpanSemitones: dto.rangeSpanSemitones,
          rangeMinMidi: dto.rangeMinMidi,
          rangeMaxMidi: dto.rangeMaxMidi,
          // Nuevas métricas ML
          voiceType: dto.voiceType,
          tessituraCenterMidi: dto.tessituraCenterMidi,
          spectralCentroid: dto.spectralCentroid,
          dynamicRangeDb: dto.dynamicRangeDb,
          registerShifts: dto.registerShifts,
        },
        meanRmsDb: dto.meanRmsDb,
        rmsConsistency: dto.rmsConsistency,
        durationSeconds: dto.durationSeconds,
      },
    });

    return {
      success: true,
      exerciseId: exercise.id,
      attemptNumber: exercise.attemptNumber,
      message: 'Range metrics registered successfully',
    };
  }

  /**
   * Registra métricas del ejercicio de ESTABILIDAD
   */
  async submitStability(dto: StabilityMetricsDto) {
    // Verificar que existe la sesión de calibración
    const calibrationSession = await this.prisma.calibrationSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!calibrationSession) {
      throw new NotFoundException(`Calibration session ${dto.sessionId} not found`);
    }

    // Crear o verificar que existe la EvaluationSession
    let evalSession = await this.prisma.evaluationSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!evalSession) {
      evalSession = await this.prisma.evaluationSession.create({
        data: {
          id: dto.sessionId,
          calibrationId: dto.sessionId,
          status: 'in_progress',
        },
      });
    }

    // Contar intentos previos de este ejercicio
    const attemptCount = await this.prisma.exerciseMetric.count({
      where: { sessionId: dto.sessionId, exerciseType: 'stability' },
    });

    // Crear el registro del ejercicio
    const exercise = await this.prisma.exerciseMetric.create({
      data: {
        sessionId: dto.sessionId,
        exerciseType: 'stability',
        attemptNumber: attemptCount + 1,
        metricsData: {
          precisionCents: dto.precisionCents,
          stabilityCents: dto.stabilityCents,
          vibratoRateHz: dto.vibratoRateHz,
          vibratoDepthCents: dto.vibratoDepthCents,
          // Métricas ML aplicables a estabilidad
          spectralCentroid: dto.spectralCentroid,
          dynamicRangeDb: dto.dynamicRangeDb,
        },
        meanRmsDb: dto.meanRmsDb,
        rmsConsistency: dto.rmsConsistency,
        durationSeconds: dto.durationSeconds,
      },
    });

    return {
      success: true,
      exerciseId: exercise.id,
      attemptNumber: exercise.attemptNumber,
      message: 'Stability metrics registered successfully',
    };
  }

  /**
   * Finaliza la evaluación, consolida métricas y calcula ruta recomendada
   */
  async finalize(dto: FinalizeMetricsDto) {
    const evalSession = await this.prisma.evaluationSession.findUnique({
      where: { id: dto.sessionId },
      include: { exercises: true },
    });

    if (!evalSession) {
      throw new NotFoundException(`Evaluation session ${dto.sessionId} not found`);
    }

    if (evalSession.status === 'finalized') {
      throw new BadRequestException('Evaluation session already finalized');
    }

    // Obtener métricas de calibración (SNR y RMS)
    const calibrationMetrics = await this.prisma.calibrationMetric.findFirst({
      where: {
        sessionId: dto.sessionId,
        phase: 'metrics',
      },
      orderBy: { timestamp: 'desc' },
    });

    // Consolidar métricas de ejercicios
    const rangeExercises = evalSession.exercises.filter((e) => e.exerciseType === 'range');
    const stabilityExercises = evalSession.exercises.filter((e) => e.exerciseType === 'stability');

    // Promediar métricas de RANGO (usar el último intento o promedio)
    const lastRange = rangeExercises[rangeExercises.length - 1];
    const rangeData = lastRange?.metricsData as any;

    // Promediar métricas de ESTABILIDAD
    const lastStability = stabilityExercises[stabilityExercises.length - 1];
    const stabilityData = lastStability?.metricsData as any;

    // Calcular potencia promedio de todos los ejercicios
    const allExercises = evalSession.exercises;
    const meanRmsDb =
      allExercises.length > 0
        ? allExercises.reduce((sum, e) => sum + (e.meanRmsDb || 0), 0) / allExercises.length
        : null;

    const rmsConsistency =
      allExercises.length > 0
        ? allExercises.reduce((sum, e) => sum + (e.rmsConsistency || 0), 0) / allExercises.length
        : null;

    // Calcular powerIndex (0-1) basado en consistencia
    const powerIndex = rmsConsistency !== null ? Math.max(0, 1 - rmsConsistency / 10) : null;

    // Consolidar nuevas métricas ML
    // voiceType, tessituraCenterMidi y registerShifts solo del ejercicio de RANGO
    const voiceType = rangeData?.voiceType || null;
    const tessituraCenterMidi = rangeData?.tessituraCenterMidi || null;
    const registerShifts = rangeData?.registerShifts || null;

    // spectralCentroid y dynamicRangeDb: promediar de todos los ejercicios que los tengan
    const exercisesWithSpectral = allExercises.filter(
      (e) => e.metricsData && (e.metricsData as any).spectralCentroid,
    );
    const spectralCentroid =
      exercisesWithSpectral.length > 0
        ? exercisesWithSpectral.reduce((sum, e) => sum + (e.metricsData as any).spectralCentroid, 0) /
          exercisesWithSpectral.length
        : null;

    const exercisesWithDynamicRange = allExercises.filter(
      (e) => e.metricsData && (e.metricsData as any).dynamicRangeDb,
    );
    const dynamicRangeDb =
      exercisesWithDynamicRange.length > 0
        ? Math.max(...exercisesWithDynamicRange.map((e) => (e.metricsData as any).dynamicRangeDb))
        : null;

    // Determinar la técnica vocal recomendada basada en las métricas
    // TODO: Implementar modelo ML real
    const recommendedRoute = this.determineRecommendedTechnique({
      rangeSpanSemitones: rangeData?.rangeSpanSemitones ?? undefined,
      precisionCents: stabilityData?.precisionCents ?? undefined,
      stabilityCents: stabilityData?.stabilityCents ?? undefined,
      powerIndex: powerIndex ?? undefined,
      voiceType: voiceType ?? undefined,
    });

    const routeConfidence = 0.85; // Valor temporal hasta implementar ML

    const finalizedSession = await this.prisma.evaluationSession.update({
      where: { id: dto.sessionId },
      data: {
        // RANGO
        rangeSpanSemitones: rangeData?.rangeSpanSemitones,
        rangeMinMidi: rangeData?.rangeMinMidi,
        rangeMaxMidi: rangeData?.rangeMaxMidi,

        // ESTABILIDAD
        precisionCents: stabilityData?.precisionCents,
        stabilityCents: stabilityData?.stabilityCents,
        vibratoRateHz: stabilityData?.vibratoRateHz,
        vibratoDepthCents: stabilityData?.vibratoDepthCents,

        // POTENCIA
        meanRmsDb,
        rmsConsistency,
        powerIndex,

        // NUEVAS MÉTRICAS ML
        voiceType,
        tessituraCenterMidi,
        spectralCentroid,
        dynamicRangeDb,
        registerShifts,

        // CALIDAD DE SEÑAL (de calibración)
        snrDb: calibrationMetrics?.snrDb,
        rmsDb: calibrationMetrics?.avgRmsDb,

        // RECOMENDACIÓN basada en métricas
        recommendedRoute,
        routeConfidence,

        status: 'finalized',
      },
    });

    // Si tenemos una técnica recomendada, iniciar el proceso de aprendizaje
    if (recommendedRoute) {
      try {
        const technique = await this.prisma.vocalTechnique.findFirst({
          where: { name: recommendedRoute },
        });

        if (technique) {
          // Crear el progreso inicial del estudiante
          const firstLesson = await this.prisma.vocalLesson.findFirst({
            where: { 
              techniqueId: technique.id,
              level: 1,
              orderIndex: 1 
            },
          });

          if (firstLesson) {
            await this.prisma.studentProgress.create({
              data: {
                userId: dto.userId,
                evaluationId: dto.sessionId,
                techniqueId: technique.id,
                lessonId: firstLesson.id,
                status: 'not_started',
                metrics: {
                  initialAccuracy: stabilityData?.precisionCents,
                  initialStability: stabilityData?.stabilityCents,
                  initialRange: rangeData?.rangeSpanSemitones,
                },
              },
            });
          }
        }
      } catch (error) {
        console.error('Error initializing learning path:', error);
        // No interrumpimos el flujo si hay error en la inicialización del aprendizaje
      }
    }

    return {
      success: true,
      evaluationSession: finalizedSession,
      message: 'Evaluation finalized successfully',
    };
  }

  /**
   * Obtiene el consolidado de una sesión
   */
  async getConsolidated(sessionId: string) {
    const evalSession = await this.prisma.evaluationSession.findUnique({
      where: { id: sessionId },
      include: {
        exercises: {
          orderBy: { completedAt: 'asc' },
        },
      },
    });

    if (!evalSession) {
      throw new NotFoundException(`Evaluation session ${sessionId} not found`);
    }

    return evalSession;
  }
}
