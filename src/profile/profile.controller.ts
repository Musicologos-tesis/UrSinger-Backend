import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@Controller('profile')
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
        name: 'Juan Pérez',
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
        name: 'Juan Pérez Actualizado',
        age: 26,
        gender: 'male',
        weeklyTrainingFreq: 5,
        createdAt: '2025-11-12T00:00:00.000Z',
        updatedAt: '2025-11-12T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }
}
