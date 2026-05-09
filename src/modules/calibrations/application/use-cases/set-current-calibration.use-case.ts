import { ICalibrationRepository } from '../../domain/repositories/calibration.repository.interface';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';

export class SetCurrentCalibrationUseCase {
  constructor(private readonly repo: ICalibrationRepository) {}

  async execute(sessionId: string) {
    const existing = await this.repo.findBySessionId(sessionId);
    if (!existing) throw new CalibrationNotFoundException(sessionId);
    return this.repo.setCurrentForProfile(sessionId, existing.profileId);
  }
}
