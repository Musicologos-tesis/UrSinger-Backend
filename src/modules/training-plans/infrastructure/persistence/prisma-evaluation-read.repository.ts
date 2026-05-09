import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IEvaluationReadRepository,
  LatestEvaluationData,
} from '../../domain/repositories/evaluation-read.repository.interface';

@Injectable()
export class PrismaEvaluationReadRepository implements IEvaluationReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async profileExists(profileId: string): Promise<boolean> {
    const record = await this.prisma.userProfile.findUnique({ where: { id: profileId }, select: { id: true } });
    return !!record;
  }

  async findLatestByProfile(profileId: string): Promise<LatestEvaluationData | null> {
    return this.prisma.evaluation.findFirst({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, weaknessesDetected: true },
    });
  }
}
