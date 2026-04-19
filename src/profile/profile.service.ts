import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private midiToNoteName(midi: number): string {
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const roundedMidi = Math.round(midi);
    const noteName = NOTE_NAMES[((roundedMidi % 12) + 12) % 12];
    const octave = Math.floor(roundedMidi / 12) - 1;
    return `${noteName}${octave}`;
  }

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

  /**
   * Obtiene el rango vocal de la evaluación más reciente de un perfil
   */
  async getLatestVocalRange(profileId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const latestEvaluation = await this.prisma.evaluation.findFirst({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sessionId: true,
        createdAt: true,
        rangeMinMidi: true,
        rangeMaxMidi: true,
        rangeSpanSemitones: true,
      },
    });

    if (!latestEvaluation) {
      throw new NotFoundException('No hay evaluaciones para este perfil');
    }

    return {
      profileId,
      evaluationId: latestEvaluation.id,
      sessionId: latestEvaluation.sessionId,
      evaluatedAt: latestEvaluation.createdAt,
      vocalRange: {
        minMidi: latestEvaluation.rangeMinMidi,
        maxMidi: latestEvaluation.rangeMaxMidi,
        spanSemitones: latestEvaluation.rangeSpanSemitones,
        minNote: this.midiToNoteName(latestEvaluation.rangeMinMidi),
        maxNote: this.midiToNoteName(latestEvaluation.rangeMaxMidi),
      },
    };
  }
}
