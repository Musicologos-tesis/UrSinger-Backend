import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ITokenService } from '../../domain/services/token.service.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export class ValidateTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(token: string): Promise<User> {
    const payload = this.tokenService.verify(token);
    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new InvalidCredentialsException();
    return user;
  }
}
