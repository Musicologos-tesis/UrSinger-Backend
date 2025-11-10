import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { SubmitExerciseAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  // === Técnicas Vocales ===
  async getTechniques() {
    return this.prisma.vocalTechnique.findMany({
      include: {
        _count: {
          select: {
            lessons: true,
            exercises: true,
          },
        },
      },
    });
  }

  async getTechniqueDetails(id: string) {
    return this.prisma.vocalTechnique.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        exercises: {
          orderBy: { difficulty: 'asc' },
        },
      },
    });
  }

  // === Lecciones ===
  async getLessons(techniqueId?: string) {
    return this.prisma.vocalLesson.findMany({
      where: techniqueId ? { techniqueId } : undefined,
      orderBy: [
        { techniqueId: 'asc' },
        { level: 'asc' },
        { orderIndex: 'asc' },
      ],
      include: {
        technique: true,
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  async createLesson(dto: CreateLessonDto) {
    return this.prisma.vocalLesson.create({
      data: {
        techniqueId: dto.techniqueId,
        title: dto.title,
        description: dto.description,
        level: dto.level,
        orderIndex: dto.orderIndex,
        prerequisites: dto.prerequisites,
        techniqueMode: dto.techniqueMode,
        pitchRange: JSON.parse(dto.pitchRange),
        dynamicRange: JSON.parse(dto.dynamicRange),
      },
      include: {
        technique: true,
      },
    });
  }

  async getLessonDetails(id: string) {
    return this.prisma.vocalLesson.findUnique({
      where: { id },
      include: {
        technique: true,
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });
  }

  // === Ejercicios ===
  async getExercises(techniqueId?: string) {
    return this.prisma.vocalExercise.findMany({
      where: techniqueId ? { techniqueId } : undefined,
      orderBy: [
        { techniqueId: 'asc' },
        { difficulty: 'asc' },
      ],
      include: {
        technique: true,
      },
    });
  }

  async createExercise(dto: CreateExerciseDto) {
    return this.prisma.vocalExercise.create({
      data: {
        techniqueId: dto.techniqueId,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        difficulty: dto.difficulty,
        pitchRange: JSON.parse(dto.pitchRange),
        dynamicRange: JSON.parse(dto.dynamicRange),
        targetMetrics: JSON.parse(dto.targetMetrics),
        audioUrl: dto.audioUrl,
        sheetMusic: dto.sheetMusic,
        instructions: dto.instructions,
      },
      include: {
        technique: true,
      },
    });
  }

  async getExerciseDetails(id: string) {
    return this.prisma.vocalExercise.findUnique({
      where: { id },
      include: {
        technique: true,
        lessons: {
          include: {
            lesson: true,
          },
        },
      },
    });
  }

  // === Progreso del Estudiante ===
  async getUserProgress(userId: string, techniqueId?: string) {
    return this.prisma.studentProgress.findMany({
      where: {
        userId,
        ...(techniqueId && { techniqueId }),
      },
      include: {
        technique: true,
        lesson: true,
        attempts: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // últimos 5 intentos
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  // === Intentos de Ejercicios ===
  async submitAttempt(dto: SubmitExerciseAttemptDto) {
    return this.prisma.exerciseAttempt.create({
      data: {
        userId: dto.userId,
        exerciseId: dto.exerciseId,
        progressId: dto.progressId,
        pitchAccuracy: dto.pitchAccuracy,
        stability: dto.stability,
        vibratoRate: dto.vibratoRate,
        vibratoDepth: dto.vibratoDepth,
        dynamicControl: dto.dynamicControl,
        techniqueScore: dto.techniqueScore,
        feedback: dto.feedback ? JSON.parse(dto.feedback) : undefined,
        audioUrl: dto.audioUrl,
        duration: dto.duration,
        completed: dto.completed,
      },
      include: {
        exercise: true,
        progress: {
          include: {
            lesson: true,
          },
        },
      },
    });
  }

  async getUserAttempts(userId: string, exerciseId?: string) {
    return this.prisma.exerciseAttempt.findMany({
      where: {
        userId,
        ...(exerciseId && { exerciseId }),
      },
      include: {
        exercise: true,
        progress: {
          include: {
            lesson: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}