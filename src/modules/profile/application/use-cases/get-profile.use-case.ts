import { IProfileRepository } from '../../domain/repositories/profile.repository.interface';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';

export class GetProfileUseCase {
  constructor(private readonly repo: IProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) throw new ProfileNotFoundException();
    return profile;
  }
}
