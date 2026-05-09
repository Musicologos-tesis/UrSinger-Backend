import { randomUUID } from 'crypto';
import { ICalibrationRepository } from '../../domain/repositories/calibration.repository.interface';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { SessionIdAlreadyExistsException } from '../../domain/exceptions/session-id-exists.exception';

export class CreateCalibrationCommand {
  constructor(
    public readonly profileId: string,
    public readonly sessionId: string,
    public readonly deviceIdHash: string,
    public readonly sampleRate: number,
    public readonly noiseFloorDbfs: number,
    public readonly snrDb?: number,
  ) {}
}

export class CreateCalibrationUseCase {
  constructor(private readonly repo: ICalibrationRepository) {}

  async execute(cmd: CreateCalibrationCommand) {
    if (!(await this.repo.profileExists(cmd.profileId))) {
      throw new ProfileNotFoundException(cmd.profileId);
    }
    if (await this.repo.sessionIdExists(cmd.sessionId)) {
      throw new SessionIdAlreadyExistsException(cmd.sessionId);
    }
    return this.repo.save({
      id: randomUUID(),
      profileId: cmd.profileId,
      sessionId: cmd.sessionId,
      deviceIdHash: cmd.deviceIdHash,
      sampleRate: cmd.sampleRate,
      noiseFloorDbfs: cmd.noiseFloorDbfs,
      snrDb: cmd.snrDb,
    });
  }
}
