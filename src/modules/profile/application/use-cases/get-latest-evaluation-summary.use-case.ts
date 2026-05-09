import { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { IEvaluationSnapshotRepository } from '../../domain/repositories/evaluation-snapshot.repository.interface';
import { VocalRange } from '../../domain/value-objects/vocal-range.vo';
import { EvaluationAnalysisService } from '../../domain/services/evaluation-analysis.service';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { NoEvaluationsException } from '../../domain/exceptions/no-evaluations.exception';

export class GetLatestEvaluationSummaryUseCase {
  private readonly analysisService = new EvaluationAnalysisService();

  constructor(
    private readonly profileRepo: IProfileRepository,
    private readonly evalRepo: IEvaluationSnapshotRepository,
  ) {}

  async execute(profileId: string) {
    const profile = await this.profileRepo.findById(profileId);
    if (!profile) throw new ProfileNotFoundException();

    const evaluations = await this.evalRepo.findLatestTwoByProfile(profileId);
    if (evaluations.length === 0) throw new NoEvaluationsException();

    const latest = evaluations[0];
    const previous = evaluations[1] ?? null;
    const latestScores = this.analysisService.buildScores(latest);
    const latestRange = new VocalRange(latest.rangeMinMidi, latest.rangeMaxMidi, latest.rangeSpanSemitones);

    const latestPayload = {
      evaluationId: latest.id,
      sessionId: latest.sessionId,
      evaluatedAt: latest.createdAt,
      range: latestRange,
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
      return { profileId, latest: latestPayload, previous: null, delta: null, trend: 'stable' };
    }

    const previousScores = this.analysisService.buildScores(previous);
    return {
      profileId,
      latest: latestPayload,
      previous: {
        evaluationId: previous.id,
        evaluatedAt: previous.createdAt,
        range: { spanSemitones: previous.rangeSpanSemitones },
        metrics: {
          precisionCents: previous.precisionCents,
          stabilityCents: previous.stabilityCents,
          dynamicRangeDb: previous.dynamicRangeDb,
          attackLatencyMs: previous.attackLatencyMs,
        },
        scores: previousScores,
      },
      delta: this.analysisService.buildDelta(latest, previous),
      trend: this.analysisService.resolveTrend(latest, previous),
    };
  }
}
