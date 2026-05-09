import { IEvaluationRepository } from '../../domain/repositories/evaluation.repository.interface';
import { IMLService } from '../../domain/services/ml.service.interface';
import { VocalMetrics } from '../../domain/value-objects/vocal-metrics.vo';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';

export class EvaluateVocalMetricsCommand {
  constructor(
    public readonly profileId: string,
    public readonly sessionId: string,
    public readonly gender: string,
    public readonly meanRmsDb: number,
    public readonly rmsConsistency: number,
    public readonly dynamicRangeDb: number,
    public readonly durationSec: number,
    public readonly precisionCents: number,
    public readonly stabilityCents: number,
    public readonly rangeMinMidi: number,
    public readonly rangeMaxMidi: number,
    public readonly rangeSpanSemitones: number,
    public readonly attackLatencyMs: number,
  ) {}
}

export class EvaluateVocalMetricsUseCase {
  constructor(
    private readonly evalRepo: IEvaluationRepository,
    private readonly mlService: IMLService,
  ) {}

  async execute(cmd: EvaluateVocalMetricsCommand) {
    if (!(await this.evalRepo.calibrationExists(cmd.sessionId))) {
      throw new CalibrationNotFoundException(cmd.sessionId);
    }
    if (!(await this.evalRepo.profileExists(cmd.profileId))) {
      throw new ProfileNotFoundException(cmd.profileId);
    }

    const metrics = new VocalMetrics(
      cmd.gender,
      cmd.meanRmsDb,
      cmd.rmsConsistency,
      cmd.dynamicRangeDb,
      cmd.durationSec,
      cmd.precisionCents,
      cmd.stabilityCents,
      cmd.rangeMinMidi,
      cmd.rangeMaxMidi,
      cmd.rangeSpanSemitones,
      cmd.attackLatencyMs,
    );

    const prediction = await this.mlService.predict(metrics);
    const evaluation = await this.evalRepo.upsert(cmd.profileId, cmd.sessionId, metrics, prediction);

    return {
      success: true,
      sessionId: cmd.sessionId,
      profileId: cmd.profileId,
      weaknessAnalysis: {
        groups: prediction.weaknessGroups,
        total: prediction.totalWeaknesses,
        message:
          prediction.totalWeaknesses > 0
            ? `Se detectaron carencias en los grupos: ${prediction.weaknessGroups.join(', ')}`
            : 'No se detectaron carencias significativas',
        confidence: prediction.confidenceScores,
        groupMetrics: prediction.groupMetrics,
      },
      createdAt: evaluation.createdAt,
    };
  }
}
