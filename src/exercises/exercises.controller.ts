import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener el catálogo completo de ejercicios',
    description:
      'Devuelve todos los grupos, ejercicios y niveles cargados en la base de datos para revisar el catálogo desde Swagger.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de ejercicios obtenido exitosamente',
    schema: {
      example: {
        totalGroups: 5,
        totalExercises: 15,
        totalLevels: 30,
        groups: [
          {
            groupNumber: 1,
            name: 'Soporte respiratorio y control del aire',
            objective: 'Desarrollar la capacidad de mantener un flujo de aire constante...',
            rationale: 'CVT: "Support"...',
            exercises: [
              {
                exerciseNumber: 1,
                name: 'Breath Flow Hold',
                rationale: 'CVT (Support) + EVM (Flow)',
                cvtDescription: 'Support: Uso activo del cuerpo...',
                evmDescription: 'Flow: Mantener un flujo de aire constante...',
                objective: 'Mantener una nota sostenida a volumen estable',
                instructions: 'El usuario elige una nota cómoda...',
                levels: [
                  {
                    level: 1,
                    description: 'Mantén la nota por 3 segundos.',
                    videoUrl: null,
                  },
                  {
                    level: 2,
                    description: 'Mantén la nota por 5 segundos.',
                    videoUrl: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })
  async getAllExercises() {
    return this.exercisesService.getAllExercises();
  }
}