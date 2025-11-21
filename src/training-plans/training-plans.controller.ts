import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TrainingPlansService } from './training-plans.service';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { CompleteExerciseDto } from './dto/complete-exercise.dto';

@ApiTags('Training Plans')
@Controller('training-plans')
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generar plan de entrenamiento semanal personalizado',
    description:
      'Genera un plan de 3 días (Lunes-Miércoles-Viernes) basado en las debilidades detectadas en la última evaluación. Utiliza algoritmos de selección ponderada (70% grupos débiles nivel 1, 30% grupos fuertes nivel 2) y distribución round-robin.',
  })
  @ApiResponse({
    status: 201,
    description: 'Plan generado exitosamente',
    schema: {
      example: {
        frequency: 3,
        focusGroups: [4],
        weekPlan: [
          {
            day: 1,
            dayName: 'Lunes',
            exercises: [
              {
                exerciseId: 10,
                exerciseName: 'Single Burst',
                groupNumber: 4,
                groupName: 'Potencia y dinámica',
                level: 1,
                description: '3-5 segundos, 3 repeticiones',
                instructions: 'Emite una nota fuerte y corta...',
                videoUrl: null,
              },
            ],
          },
          {
            day: 3,
            dayName: 'Miércoles',
            exercises: [],
          },
          {
            day: 5,
            dayName: 'Viernes',
            exercises: [],
          },
        ],
        instructions:
          'Repite esta misma semana durante 4 semanas consecutivas. Al finalizar el mes, realiza una nueva evaluación para ajustar tu plan.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil no encontrado o sin evaluaciones previas',
  })
  async generatePlan(@Body() generatePlanDto: GeneratePlanDto) {
    return this.trainingPlansService.generateWeeklyPlan(
      generatePlanDto.profileId,
    );
  }

  @Get('active/:profileId')
  @ApiOperation({
    summary: 'Obtener plan de entrenamiento activo',
    description: 'Obtiene el plan de entrenamiento activo del usuario.',
  })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({
    status: 200,
    description: 'Plan activo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró un plan activo',
  })
  async getActivePlan(@Param('profileId') profileId: string) {
    return this.trainingPlansService.getActivePlan(profileId);
  }

  @Put('exercise/complete')
  @ApiOperation({
    summary: 'Marcar ejercicio como completado',
    description: 'Incrementa el contador de completados del ejercicio y registra la fecha actual. El ejercicio puede completarse hasta 4 veces (una por semana).',
  })
  @ApiResponse({
    status: 200,
    description: 'Ejercicio actualizado',
    schema: {
      example: {
        success: true,
        exerciseId: 'clxyz123',
        completionCount: 2,
        completedDates: ['2025-11-17T19:00:00.000Z', '2025-11-24T19:00:00.000Z'],
      },
    },
  })
  async completeExercise(@Body() completeExerciseDto: CompleteExerciseDto) {
    return this.trainingPlansService.completeExercise(
      completeExerciseDto.planExerciseId,
    );
  }

  @Get('progress/:profileId')
  @ApiOperation({
    summary: 'Obtener progreso del plan',
    description: 'Obtiene estadísticas de progreso del plan activo: total de ejercicios, completados, porcentaje, días restantes.',
  })
  @ApiParam({ name: 'profileId', description: 'ID del perfil' })
  @ApiResponse({
    status: 200,
    description: 'Progreso obtenido',
  })
  async getProgress(@Param('profileId') profileId: string) {
    return this.trainingPlansService.getProgress(profileId);
  }

  @Get('exercise/:planExerciseId')
  @ApiOperation({
    summary: 'Obtener un ejercicio específico del plan',
    description: 'Obtiene los detalles completos de un ejercicio del plan de entrenamiento, incluyendo CVT y EVM.',
  })
  @ApiParam({ name: 'planExerciseId', description: 'ID del ejercicio en el plan' })
  @ApiResponse({
    status: 200,
    description: 'Ejercicio encontrado',
    schema: {
      example: {
        planExerciseId: 'clxyz123',
        exerciseLevelId: 10,
        exerciseId: 5,
        exerciseName: 'Single Burst',
        groupNumber: 4,
        groupName: 'Potencia y control dinámico',
        level: 1,
        description: 'Emisión fuerte de 3 s en nota media.',
        instructions: 'UrSinger da una nota guía. El usuario la emite con un ataque energético...',
        videoUrl: null,
        cvtDescription: 'Twang/Overdrive: Modos vocales que permiten proyección potente sin tensión.',
        evmDescription: null,
        completionCount: 2,
        completedDates: ['2025-11-17T19:00:00.000Z', '2025-11-24T19:00:00.000Z'],
        isCompletedThisWeek: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ejercicio no encontrado',
  })
  async getExercise(@Param('planExerciseId') planExerciseId: string) {
    return this.trainingPlansService.getExercise(planExerciseId);
  }
}
