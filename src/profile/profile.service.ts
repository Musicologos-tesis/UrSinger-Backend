import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el perfil de un usuario por su ID
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return profile;
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Verificar que el perfil existe
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Actualizar perfil
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });

    return updatedProfile;
  }
}
