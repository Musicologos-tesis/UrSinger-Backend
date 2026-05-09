import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export interface UserProfileData {
  name: string;
  age: number;
  gender: string;
  weeklyTrainingFreq: number;
}

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User, profile: UserProfileData): Promise<User>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
