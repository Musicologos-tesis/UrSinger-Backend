import { Controller, Post, Body, Get, Param, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { CompleteExerciseDto } from './dto/complete-exercise.dto';
import { GenerateWeeklyPlanUseCase } from '../../application/use-cases/generate-weekly-plan.use-case';
import { GetActivePlanUseCase } from '../../application/use-cases/get-active-plan.use-case';
import { CompleteExerciseUseCase } from '../../application/use-cases/complete-exercise.use-case';
import { GetPlanProgressUseCase } from '../../application/use-cases/get-plan-progress.use-case';
import { GetPlanExerciseUseCase } from '../../application/use-cases/get-plan-exercise.use-case';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { NoEvaluationFoundException } from '../../domain/exceptions/no-evaluation-found.exception';
import { NoActivePlanException } from '../../domain/exceptions/no-active-plan.exception';
import { ExerciseNotFoundException } from '../../domain/exceptions/exercise-not-found.exception';

@ApiTags('Training Plans')
@Controller('training-plans')
export class TrainingPlansController {
  constructor(
    private readonly generateUseCase: GenerateWeeklyPlanUseCase,
    private readonly getActivePlanUseCase: GetActivePlanUseCase,
    private readonly completeExerciseUseCase: CompleteExerciseUseCase,
    private readonly getProgressUseCase: GetPlanProgressUseCase,
    private readonly getExerciseUseCase: GetPlanExerciseUseCase,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generar plan de entrenamiento semanal personalizado' })
  @ApiResponse({ status: 201, description: 'Plan generado exitosamente' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado o sin evaluaciones previas' })
  async generatePlan(@Body() dto: GeneratePlanDto) {
    try {
      return await this.generateUseCase.execute(dto.profileId);
    } catch (e) {
      if (e instanceof ProfileNotFoundException || e instanceof NoEvaluationFoundException)
        throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get('active/:profileId')
  @ApiOperation({ summary: 'Obtener plan de entrenamiento activo' })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Plan activo encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró un plan activo' })
  async getActivePlan(@Param('profileId') profileId: string) {
    try {
      return await this.getActivePlanUseCase.execute(profileId);
    } catch (e) {
      if (e instanceof NoActivePlanException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Put('exercise/complete')
  @ApiOperation({ summary: 'Marcar ejercicio como completado' })
  @ApiResponse({ status: 200, description: 'Ejercicio actualizado' })
  async completeExercise(@Body() dto: CompleteExerciseDto) {
    try {
      return await this.completeExerciseUseCase.execute(dto.planExerciseId);
    } catch (e) {
      if (e instanceof ExerciseNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get('progress/:profileId')
  @ApiOperation({ summary: 'Obtener progreso del plan' })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({ status: 200, description: 'Progreso obtenido' })
  async getProgress(@Param('profileId') profileId: string) {
    try {
      return await this.getProgressUseCase.execute(profileId);
    } catch (e) {
      if (e instanceof NoActivePlanException) throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Get('exercise/:planExerciseId')
  @ApiOperation({ summary: 'Obtener un ejercicio específico del plan' })
  @ApiParam({ name: 'planExerciseId', description: 'ID del ejercicio en el plan' })
  @ApiResponse({ status: 200, description: 'Ejercicio encontrado' })
  @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
  async getExercise(@Param('planExerciseId') planExerciseId: string) {
    try {
      return await this.getExerciseUseCase.execute(planExerciseId);
    } catch (e) {
      if (e instanceof ExerciseNotFoundException) throw new NotFoundException(e.message);
      throw e;
    }
  }
}
