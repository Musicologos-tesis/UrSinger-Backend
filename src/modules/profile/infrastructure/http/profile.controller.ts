import { Controller, Get, Put, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { GetLatestVocalRangeUseCase } from '../../application/use-cases/get-latest-vocal-range.use-case';
import { GetLatestEvaluationSummaryUseCase } from '../../application/use-cases/get-latest-evaluation-summary.use-case';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { NoEvaluationsException } from '../../domain/exceptions/no-evaluations.exception';

@ApiTags('Profile')
@Controller(['profile', 'profiles'])
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getVocalRangeUseCase: GetLatestVocalRangeUseCase,
    private readonly getEvalSummaryUseCase: GetLatestEvaluationSummaryUseCase,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener perfil de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async getProfile(@Param('userId') userId: string) {
    try {
      return await this.getProfileUseCase.execute(userId);
    } catch (e) {
      if (e instanceof ProfileNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Actualizar perfil de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async updateProfile(@Param('userId') userId: string, @Body() dto: UpdateProfileDto) {
    try {
      return await this.updateProfileUseCase.execute(userId, dto);
    } catch (e) {
      if (e instanceof ProfileNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get(':profileId/vocal-range/latest')
  @ApiOperation({ summary: 'Obtener rango vocal de la ultima evaluacion del perfil' })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Rango vocal obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil o evaluacion no encontrada' })
  async getLatestVocalRange(@Param('profileId') profileId: string) {
    try {
      return await this.getVocalRangeUseCase.execute(profileId);
    } catch (e) {
      if (e instanceof ProfileNotFoundException || e instanceof NoEvaluationsException)
        throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get(':profileId/evaluations/latest-summary')
  @ApiOperation({ summary: 'Obtener resumen de ultima evaluacion y comparacion' })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Resumen de evaluaciones obtenido' })
  @ApiResponse({ status: 404, description: 'Perfil sin evaluaciones' })
  async getLatestEvaluationSummary(@Param('profileId') profileId: string) {
    try {
      return await this.getEvalSummaryUseCase.execute(profileId);
    } catch (e) {
      if (e instanceof ProfileNotFoundException || e instanceof NoEvaluationsException)
        throw new NotFoundException(e.message);
      throw e;
    }
  }
}
