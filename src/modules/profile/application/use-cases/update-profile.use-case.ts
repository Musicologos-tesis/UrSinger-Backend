import { IProfileRepository, ProfileUpdateData } from '../../domain/repositories/profile.repository.interface';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';

export class UpdateProfileUseCase {
  constructor(private readonly repo: IProfileRepository) {}

  async execute(userId: string, data: ProfileUpdateData) {
    const existing = await this.repo.findByUserId(userId);
    if (!existing) throw new ProfileNotFoundException();
    return this.repo.update(userId, data);
  }
}
