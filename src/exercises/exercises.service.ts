import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllExercises() {
    const groups = await this.prisma.exerciseGroup.findMany({
      orderBy: { groupNumber: 'asc' },
      include: {
        exercises: {
          orderBy: { exerciseNumber: 'asc' },
          include: {
            levels: {
              orderBy: { level: 'asc' },
            },
          },
        },
      },
    });

    return {
      totalGroups: groups.length,
      totalExercises: groups.reduce(
        (sum, group) => sum + group.exercises.length,
        0,
      ),
      totalLevels: groups.reduce(
        (sum, group) =>
          sum +
          group.exercises.reduce(
            (exerciseSum, exercise) => exerciseSum + exercise.levels.length,
            0,
          ),
        0,
      ),
      groups,
    };
  }
}