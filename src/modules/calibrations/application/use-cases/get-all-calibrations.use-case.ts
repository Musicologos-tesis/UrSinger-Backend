import { ICalibrationRepository } from '../../domain/repositories/calibration.repository.interface';

export class GetAllCalibrationsUseCase {
  constructor(private readonly repo: ICalibrationRepository) {}

  async execute(profileId: string) {
    return this.repo.findAllByProfile(profileId);
  }
}
