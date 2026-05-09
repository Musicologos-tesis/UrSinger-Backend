import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IExerciseReadRepository } from '../../domain/repositories/exercise-read.repository.interface';
import { SelectableExercise } from '../../domain/services/exercise-selection.service';

@Injectable()
export class PrismaExerciseReadRepository implements IExerciseReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByGroupsAndLevel(groupNumbers: number[], level: number): Promise<SelectableExercise[]> {
    const records = await this.prisma.exerciseLevel.findMany({
      where: { level, exercise: { group: { groupNumber: { in: groupNumbers } } } },
      include: { exercise: { include: { group: true } } },
    });

    return records.map((el) => ({
      exerciseLevelId: el.id,
      exerciseId: el.exercise.id,
      exerciseName: el.exercise.name,
      groupNumber: el.exercise.group.groupNumber,
      groupName: el.exercise.group.name,
      level: el.level,
      description: el.description,
      instructions: el.exercise.instructions,
      videoUrl: el.videoUrl,
      cvtDescription: el.exercise.cvtDescription,
      evmDescription: el.exercise.evmDescription,
    }));
  }
}
