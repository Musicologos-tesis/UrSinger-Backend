import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetExerciseCatalogUseCase } from '../../application/use-cases/get-exercise-catalog.use-case';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly getCatalogUseCase: GetExerciseCatalogUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el catálogo completo de ejercicios' })
  @ApiResponse({ status: 200, description: 'Catálogo de ejercicios obtenido exitosamente' })
  async getAllExercises() {
    return this.getCatalogUseCase.execute();
  }
}
