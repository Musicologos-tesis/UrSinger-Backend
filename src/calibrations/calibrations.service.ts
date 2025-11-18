import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalibrationDto } from './dto/create-calibration.dto';

@Injectable()
export class CalibrationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva calibración y la marca como actual
   */
  async create(dto: CreateCalibrationDto) {
    // Verificar que el perfil existe
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: dto.profileId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Verificar que el sessionId no exista
    const existing = await this.prisma.calibration.findUnique({
      where: { sessionId: dto.sessionId },
    });

    if (existing) {
      throw new ConflictException('El sessionId ya existe');
    }

    // Desmarcar la calibración actual previa (si existe)
    await this.prisma.calibration.updateMany({
      where: {
        profileId: dto.profileId,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    // Crear nueva calibración como actual
    const calibration = await this.prisma.calibration.create({
      data: {
        ...dto,
        isCurrent: true,
      },
    });

    return calibration;
  }

  /**
   * Obtiene la calibración actual de un perfil
   */
  async getCurrent(profileId: string) {
    const calibration = await this.prisma.calibration.findFirst({
      where: {
        profileId,
        isCurrent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!calibration) {
      throw new NotFoundException('No hay calibración actual para este perfil');
    }

    return calibration;
  }

  /**
   * Obtiene todas las calibraciones de un perfil
   */
  async getAllByProfile(profileId: string) {
    return this.prisma.calibration.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene una calibración por sessionId
   */
  async getBySessionId(sessionId: string) {
    const calibration = await this.prisma.calibration.findUnique({
      where: { sessionId },
    });

    if (!calibration) {
      throw new NotFoundException('Calibración no encontrada');
    }

    return calibration;
  }

  /**
   * Marca una calibración existente como actual
   */
  async setAsCurrent(sessionId: string) {
    const calibration = await this.prisma.calibration.findUnique({
      where: { sessionId },
    });

    if (!calibration) {
      throw new NotFoundException('Calibración no encontrada');
    }

    // Desmarcar calibración actual previa
    await this.prisma.calibration.updateMany({
      where: {
        profileId: calibration.profileId,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    // Marcar esta como actual
    return this.prisma.calibration.update({
      where: { sessionId },
      data: { isCurrent: true },
    });
  }
}
