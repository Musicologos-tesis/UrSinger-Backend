import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ICalibrationRepository,
  CreateCalibrationData,
} from '../../domain/repositories/calibration.repository.interface';
import { Calibration } from '../../domain/entities/calibration.entity';

@Injectable()
export class PrismaCalibrationRepository implements ICalibrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async profileExists(profileId: string): Promise<boolean> {
    const profile = await this.prisma.userProfile.findUnique({ where: { id: profileId }, select: { id: true } });
    return !!profile;
  }

  async sessionIdExists(sessionId: string): Promise<boolean> {
    const record = await this.prisma.calibration.findUnique({ where: { sessionId }, select: { id: true } });
    return !!record;
  }

  async save(data: CreateCalibrationData): Promise<Calibration> {
    await this.prisma.calibration.updateMany({
      where: { profileId: data.profileId, isCurrent: true },
      data: { isCurrent: false },
    });
    const record = await this.prisma.calibration.create({
      data: { ...data, isCurrent: true },
    });
    return this.toDomain(record);
  }

  async findCurrentByProfile(profileId: string): Promise<Calibration | null> {
    const record = await this.prisma.calibration.findFirst({
      where: { profileId, isCurrent: true },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAllByProfile(profileId: string): Promise<Calibration[]> {
    const records = await this.prisma.calibration.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findBySessionId(sessionId: string): Promise<Calibration | null> {
    const record = await this.prisma.calibration.findUnique({ where: { sessionId } });
    return record ? this.toDomain(record) : null;
  }

  async setCurrentForProfile(sessionId: string, profileId: string): Promise<Calibration> {
    await this.prisma.calibration.updateMany({
      where: { profileId, isCurrent: true },
      data: { isCurrent: false },
    });
    const record = await this.prisma.calibration.update({
      where: { sessionId },
      data: { isCurrent: true },
    });
    return this.toDomain(record);
  }

  private toDomain(r: {
    id: string;
    profileId: string;
    sessionId: string;
    deviceIdHash: string;
    sampleRate: number;
    noiseFloorDbfs: number;
    snrDb: number | null;
    isCurrent: boolean;
    createdAt: Date;
  }): Calibration {
    return Calibration.reconstitute(r.id, r.profileId, r.sessionId, r.deviceIdHash, r.sampleRate, r.noiseFloorDbfs, r.snrDb, r.isCurrent, r.createdAt);
  }
}
