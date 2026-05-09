import { ICalibrationRepository } from '../../domain/repositories/calibration.repository.interface';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';

export class GetCalibrationBySessionUseCase {
  constructor(private readonly repo: ICalibrationRepository) {}

  async execute(sessionId: string) {
    const calibration = await this.repo.findBySessionId(sessionId);
    if (!calibration) throw new CalibrationNotFoundException(sessionId);
    return calibration;
  }
}
