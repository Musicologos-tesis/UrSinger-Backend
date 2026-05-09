import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IEvaluationRepository,
  EvaluationRecord,
} from '../../domain/repositories/evaluation.repository.interface';
import { VocalMetrics } from '../../domain/value-objects/vocal-metrics.vo';
import { MLPrediction } from '../../domain/value-objects/ml-prediction.vo';

@Injectable()
export class PrismaEvaluationRepository implements IEvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async calibrationExists(sessionId: string): Promise<boolean> {
    const record = await this.prisma.calibration.findUnique({ where: { sessionId }, select: { id: true } });
    return !!record;
  }

  async profileExists(profileId: string): Promise<boolean> {
    const record = await this.prisma.userProfile.findUnique({ where: { id: profileId }, select: { id: true } });
    return !!record;
  }

  async upsert(
    profileId: string,
    sessionId: string,
    metrics: VocalMetrics,
    prediction: MLPrediction,
  ): Promise<EvaluationRecord> {
    const data = {
      meanRmsDb: metrics.meanRmsDb,
      rmsConsistency: metrics.rmsConsistency,
      dynamicRangeDb: metrics.dynamicRangeDb,
      durationSec: metrics.durationSec,
      precisionCents: metrics.precisionCents,
      stabilityCents: metrics.stabilityCents,
      rangeMinMidi: metrics.rangeMinMidi,
      rangeMaxMidi: metrics.rangeMaxMidi,
      rangeSpanSemitones: metrics.rangeSpanSemitones,
      attackLatencyMs: metrics.attackLatencyMs,
      weaknessesDetected: prediction.weaknessesDetected,
      totalWeaknesses: prediction.totalWeaknesses,
      confidenceScores: prediction.confidenceScores,
      groupMetrics: prediction.groupMetrics,
    };

    return this.prisma.evaluation.upsert({
      where: { sessionId },
      update: data as any,
      create: { profileId, sessionId, ...data } as any,
    });
  }

  async findBySessionId(sessionId: string): Promise<EvaluationRecord | null> {
    return this.prisma.evaluation.findUnique({ where: { sessionId } });
  }
}
