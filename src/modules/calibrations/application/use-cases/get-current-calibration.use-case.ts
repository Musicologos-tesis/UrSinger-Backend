import { ICalibrationRepository } from '../../domain/repositories/calibration.repository.interface';
import { CalibrationNotFoundException } from '../../domain/exceptions/calibration-not-found.exception';

export class GetCurrentCalibrationUseCase {
  constructor(private readonly repo: ICalibrationRepository) {}

  async execute(profileId: string) {
    const calibration = await this.repo.findCurrentByProfile(profileId);
    if (!calibration) throw new CalibrationNotFoundException(`perfil ${profileId}`);
    return calibration;
  }
}
