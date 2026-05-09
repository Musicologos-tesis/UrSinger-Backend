import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ITokenService } from '../../domain/services/token.service.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export interface LoginResult {
  access_token: string;
  token_type: string;
  user: User;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(email: string, plainPassword: string): Promise<LoginResult> {
    const emailVO = new Email(email);
    const user = await this.userRepo.findByEmail(emailVO);
    if (!user) throw new InvalidCredentialsException();

    const valid = await user.password.verify(plainPassword);
    if (!valid) throw new InvalidCredentialsException();

    const token = this.tokenService.sign({
      sub: user.id,
      email: user.email.toString(),
    });

    return { access_token: token, token_type: 'Bearer', user };
  }
}
