import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IExerciseCatalogRepository, ExerciseGroupData } from '../../domain/repositories/exercise-catalog.repository.interface';

@Injectable()
export class PrismaExerciseCatalogRepository implements IExerciseCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ExerciseGroupData[]> {
    const groups = await this.prisma.exerciseGroup.findMany({
      orderBy: { groupNumber: 'asc' },
      include: {
        exercises: {
          orderBy: { exerciseNumber: 'asc' },
          include: { levels: { orderBy: { level: 'asc' } } },
        },
      },
    });

    return groups.map((g) => ({
      groupNumber: g.groupNumber,
      name: g.name,
      objective: g.objective,
      rationale: g.rationale,
      exercises: g.exercises.map((e) => ({
        exerciseNumber: e.exerciseNumber,
        name: e.name,
        rationale: e.rationale,
        cvtDescription: e.cvtDescription,
        evmDescription: e.evmDescription,
        objective: e.objective,
        instructions: e.instructions,
        levels: e.levels.map((l) => ({
          level: l.level,
          description: l.description,
          videoUrl: l.videoUrl,
        })),
      })),
    }));
  }
}
