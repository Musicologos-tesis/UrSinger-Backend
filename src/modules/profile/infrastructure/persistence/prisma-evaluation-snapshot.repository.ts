import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IEvaluationSnapshotRepository, EvaluationSnapshot } from '../../domain/repositories/evaluation-snapshot.repository.interface';

@Injectable()
export class PrismaEvaluationSnapshotRepository implements IEvaluationSnapshotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestTwoByProfile(profileId: string): Promise<EvaluationSnapshot[]> {
    return this.prisma.evaluation.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: {
        id: true,
        sessionId: true,
        createdAt: true,
        rangeMinMidi: true,
        rangeMaxMidi: true,
        rangeSpanSemitones: true,
        precisionCents: true,
        stabilityCents: true,
        dynamicRangeDb: true,
        attackLatencyMs: true,
        weaknessesDetected: true,
      },
    });
  }
}
