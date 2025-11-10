import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { SubmitExerciseAttemptDto } from './dto/submit-attempt.dto';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // === Técnicas Vocales ===
  @Get('techniques')
  async getTechniques() {
    return this.learningService.getTechniques();
  }

  @Get('techniques/:id')
  async getTechniqueDetails(@Param('id') id: string) {
    return this.learningService.getTechniqueDetails(id);
  }

  // === Lecciones ===
  @Get('lessons')
  async getLessons(@Query('techniqueId') techniqueId?: string) {
    return this.learningService.getLessons(techniqueId);
  }

  @Post('lessons')
  async createLesson(@Body() dto: CreateLessonDto) {
    return this.learningService.createLesson(dto);
  }

  @Get('lessons/:id')
  async getLessonDetails(@Param('id') id: string) {
    return this.learningService.getLessonDetails(id);
  }

  // === Ejercicios ===
  @Get('exercises')
  async getExercises(@Query('techniqueId') techniqueId?: string) {
    return this.learningService.getExercises(techniqueId);
  }

  @Post('exercises')
  async createExercise(@Body() dto: CreateExerciseDto) {
    return this.learningService.createExercise(dto);
  }

  @Get('exercises/:id')
  async getExerciseDetails(@Param('id') id: string) {
    return this.learningService.getExerciseDetails(id);
  }

  // === Progreso del Estudiante ===
  @Get('progress/:userId')
  async getUserProgress(
    @Param('userId') userId: string,
    @Query('techniqueId') techniqueId?: string,
  ) {
    return this.learningService.getUserProgress(userId, techniqueId);
  }

  // === Intentos de Ejercicios ===
  @Post('attempts')
  async submitAttempt(@Body() dto: SubmitExerciseAttemptDto) {
    return this.learningService.submitAttempt(dto);
  }

  @Get('attempts/:userId')
  async getUserAttempts(
    @Param('userId') userId: string,
    @Query('exerciseId') exerciseId?: string,
  ) {
    return this.learningService.getUserAttempts(userId, exerciseId);
  }
}