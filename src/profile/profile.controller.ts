import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@Controller(['profile', 'profiles'])
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener perfil de usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'clx123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        id: 'clx123xyz',
        userId: 'clx123abc',
        name: 'Juan Perez',
        age: 25,
        gender: 'male',
        weeklyTrainingFreq: 3,
        createdAt: '2025-11-12T00:00:00.000Z',
        updatedAt: '2025-11-12T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async getProfile(@Param('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Actualizar perfil de usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'clx123abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    schema: {
      example: {
        id: 'clx123xyz',
        userId: 'clx123abc',
        name: 'Juan Perez Actualizado',
        age: 26,
        gender: 'male',
        weeklyTrainingFreq: 5,
        createdAt: '2025-11-12T00:00:00.000Z',
        updatedAt: '2025-11-12T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Get(':profileId/vocal-range/latest')
  @ApiOperation({ summary: 'Obtener rango vocal de la ultima evaluacion del perfil' })
  @ApiParam({
    name: 'profileId',
    description: 'ID del perfil',
    example: 'clx123profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Rango vocal obtenido exitosamente',
    schema: {
      example: {
        profileId: 'clx123profile',
        evaluationId: 'clx999eval',
        sessionId: 'e8f7a53f-91f5-4a9d-81db-4d1a5705d97f',
        evaluatedAt: '2026-04-16T10:15:30.000Z',
        vocalRange: {
          minMidi: 48,
          maxMidi: 72,
          spanSemitones: 24,
          minNote: 'C3',
          maxNote: 'C5',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil o evaluacion no encontrada' })
  async getLatestVocalRange(@Param('profileId') profileId: string) {
    return this.profileService.getLatestVocalRange(profileId);
  }

  @Get(':profileId/evaluations/latest-summary')
  @ApiOperation({
    summary: 'Obtener resumen de ultima evaluacion y comparacion',
    description:
      'Devuelve ultima evaluacion, evaluacion anterior (si existe), deltas y tendencia (improving/stable/declining).',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID del perfil',
    example: 'clx123profile',
  })
  @ApiResponse({ status: 200, description: 'Resumen de evaluaciones obtenido' })
  @ApiResponse({ status: 404, description: 'Perfil sin evaluaciones' })
  async getLatestEvaluationSummary(@Param('profileId') profileId: string) {
    return this.profileService.getLatestEvaluationSummary(profileId);
  }
}
