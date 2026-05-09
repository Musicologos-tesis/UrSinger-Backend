import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IProfileRepository, ProfileRecord, ProfileUpdateData } from '../../domain/repositories/profile.repository.interface';

@Injectable()
export class PrismaProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    return this.prisma.userProfile.findUnique({ where: { userId } });
  }

  async findById(profileId: string): Promise<ProfileRecord | null> {
    return this.prisma.userProfile.findUnique({ where: { id: profileId } });
  }

  async update(userId: string, data: ProfileUpdateData): Promise<ProfileRecord> {
    return this.prisma.userProfile.update({ where: { userId }, data });
  }
}
