import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { IUserRepository, UserProfileData } from '../../domain/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly age: number,
    public readonly gender: string,
    public readonly weeklyTrainingFreq: number,
  ) {}
}

export class RegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const email = new Email(command.email);

    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new UserAlreadyExistsException(email.toString());

    const password = await Password.create(command.password);
    const user = User.create(randomUUID(), email, password);

    return this.userRepo.save(user, {
      name: command.name,
      age: command.age,
      gender: command.gender,
      weeklyTrainingFreq: command.weeklyTrainingFreq,
    });
  }
}
