import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository, UserProfileData } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User, profile: UserProfileData): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email.toString(),
        password: user.password.toString(),
        profile: { create: profile },
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstitute(
      record.id,
      new Email(record.email),
      Password.fromHash(record.password),
      record.createdAt,
      record.updatedAt,
    );
  }
}
