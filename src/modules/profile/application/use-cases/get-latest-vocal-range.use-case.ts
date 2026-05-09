import { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { IEvaluationSnapshotRepository } from '../../domain/repositories/evaluation-snapshot.repository.interface';
import { VocalRange } from '../../domain/value-objects/vocal-range.vo';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { NoEvaluationsException } from '../../domain/exceptions/no-evaluations.exception';

export class GetLatestVocalRangeUseCase {
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
    const range = new VocalRange(latest.rangeMinMidi, latest.rangeMaxMidi, latest.rangeSpanSemitones);

    return {
      profileId,
      evaluationId: latest.id,
      sessionId: latest.sessionId,
      evaluatedAt: latest.createdAt,
      vocalRange: range,
    };
  }
}
