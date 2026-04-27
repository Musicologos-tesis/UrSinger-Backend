import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

type Trend = 'improving' | 'stable' | 'declining';

type EvaluationSnapshot = {
  id: string;
  sessionId: string;
  createdAt: Date;
  rangeMinMidi: number;
  rangeMaxMidi: number;
  rangeSpanSemitones: number;
  precisionCents: number;
  stabilityCents: number;
  dynamicRangeDb: number;
  attackLatencyMs: number;
  weaknessesDetected: string[];
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private midiToNoteName(midi: number): string {
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const roundedMidi = Math.round(midi);
    const noteName = NOTE_NAMES[((roundedMidi % 12) + 12) % 12];
    const octave = Math.floor(roundedMidi / 12) - 1;
    return `${noteName}${octave}`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private buildScores(evaluation: EvaluationSnapshot) {
    const intonation = Math.round(this.clamp(100 - evaluation.precisionCents * 2, 0, 100));
    const stability = Math.round(this.clamp(100 - evaluation.stabilityCents * 2, 0, 100));
    const dynamics = Math.round(this.clamp(evaluation.dynamicRangeDb * 5, 0, 100));
    const overall = Math.round((intonation + stability + dynamics) / 3);

    return {
      intonation,
      stability,
      dynamics,
      overall,
    };
  }

  private resolveTrend(latest: EvaluationSnapshot, previous: EvaluationSnapshot): Trend {
    const latestScores = this.buildScores(latest);
    const previousScores = this.buildScores(previous);

    let better = 0;
    let worse = 0;

    const greaterIsBetter = [
      latest.rangeSpanSemitones > previous.rangeSpanSemitones,
      latest.dynamicRangeDb > previous.dynamicRangeDb,
      latestScores.overall > previousScores.overall,
    ];

    const lowerIsBetter = [
      latest.precisionCents < previous.precisionCents,
      latest.stabilityCents < previous.stabilityCents,
      latest.attackLatencyMs < previous.attackLatencyMs,
    ];

    for (const improved of [...greaterIsBetter, ...lowerIsBetter]) {
      if (improved) {
        better += 1;
      } else {
        worse += 1;
      }
    }

    if (better > worse) {
      return 'improving';
    }

    if (worse > better) {
      return 'declining';
    }

    return 'stable';
  }

  /**
   * Obtiene el perfil de un usuario por su ID
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return profile;
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });

    return updatedProfile;
  }

  async isOwnedByUser(profileId: string, userId: string): Promise<boolean> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    return !!profile && profile.userId === userId;
  }

  /**
   * Obtiene el rango vocal de la evaluacion mas reciente de un perfil
   */
  async getLatestVocalRange(profileId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const latestEvaluation = await this.prisma.evaluation.findFirst({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sessionId: true,
        createdAt: true,
        rangeMinMidi: true,
        rangeMaxMidi: true,
        rangeSpanSemitones: true,
      },
    });

    if (!latestEvaluation) {
      throw new NotFoundException('No hay evaluaciones para este perfil');
    }

    return {
      profileId,
      evaluationId: latestEvaluation.id,
      sessionId: latestEvaluation.sessionId,
      evaluatedAt: latestEvaluation.createdAt,
      vocalRange: {
        minMidi: latestEvaluation.rangeMinMidi,
        maxMidi: latestEvaluation.rangeMaxMidi,
        spanSemitones: latestEvaluation.rangeSpanSemitones,
        minNote: this.midiToNoteName(latestEvaluation.rangeMinMidi),
        maxNote: this.midiToNoteName(latestEvaluation.rangeMaxMidi),
      },
    };
  }

  /**
   * Obtiene la ultima evaluacion y compara contra la anterior
   */
  async getLatestEvaluationSummary(profileId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const evaluations = await this.prisma.evaluation.findMany({
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

    if (evaluations.length === 0) {
      throw new NotFoundException('Perfil sin evaluaciones');
    }

    const latest = evaluations[0] as EvaluationSnapshot;
    const previous = (evaluations[1] as EvaluationSnapshot) ?? null;

    const latestScores = this.buildScores(latest);

    const latestPayload = {
      evaluationId: latest.id,
      sessionId: latest.sessionId,
      evaluatedAt: latest.createdAt,
      range: {
        minMidi: latest.rangeMinMidi,
        maxMidi: latest.rangeMaxMidi,
        spanSemitones: latest.rangeSpanSemitones,
        minNote: this.midiToNoteName(latest.rangeMinMidi),
        maxNote: this.midiToNoteName(latest.rangeMaxMidi),
      },
      metrics: {
        precisionCents: latest.precisionCents,
        stabilityCents: latest.stabilityCents,
        dynamicRangeDb: latest.dynamicRangeDb,
        attackLatencyMs: latest.attackLatencyMs,
      },
      scores: latestScores,
      weaknessesDetected: latest.weaknessesDetected,
    };

    if (!previous) {
      return {
        profileId,
        latest: latestPayload,
        previous: null,
        delta: null,
        trend: 'stable' as Trend,
      };
    }

    const previousScores = this.buildScores(previous);

    const previousPayload = {
      evaluationId: previous.id,
      evaluatedAt: previous.createdAt,
      range: {
        spanSemitones: previous.rangeSpanSemitones,
      },
      metrics: {
        precisionCents: previous.precisionCents,
        stabilityCents: previous.stabilityCents,
        dynamicRangeDb: previous.dynamicRangeDb,
        attackLatencyMs: previous.attackLatencyMs,
      },
      scores: previousScores,
    };

    const delta = {
      rangeSpanSemitones: this.round2(latest.rangeSpanSemitones - previous.rangeSpanSemitones),
      precisionCents: this.round2(latest.precisionCents - previous.precisionCents),
      stabilityCents: this.round2(latest.stabilityCents - previous.stabilityCents),
      dynamicRangeDb: this.round2(latest.dynamicRangeDb - previous.dynamicRangeDb),
      attackLatencyMs: this.round2(latest.attackLatencyMs - previous.attackLatencyMs),
      overallScore: this.round2(latestScores.overall - previousScores.overall),
    };

    return {
      profileId,
      latest: latestPayload,
      previous: previousPayload,
      delta,
      trend: this.resolveTrend(latest, previous),
    };
  }
}
