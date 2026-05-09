import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ITrainingPlanRepository,
  CreatePlanData,
  ActivePlan,
} from '../../domain/repositories/training-plan.repository.interface';

const PLAN_INCLUDE = {
  exercises: {
    include: {
      exerciseLevel: {
        include: { exercise: { include: { group: true } } },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { orderInDay: 'asc' }] as any[],
  },
};

@Injectable()
export class PrismaTrainingPlanRepository implements ITrainingPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replacePreviousPlans(profileId: string): Promise<void> {
    await this.prisma.trainingPlan.updateMany({
      where: { profileId, status: 'active' },
      data: { status: 'replaced' },
    });
  }

  async create(data: CreatePlanData): Promise<ActivePlan> {
    return this.prisma.trainingPlan.create({
      data: {
        profileId: data.profileId,
        evaluationId: data.evaluationId,
        startDate: data.startDate,
        endDate: data.endDate,
        frequency: data.frequency,
        focusGroups: data.focusGroups,
        status: 'active',
        exercises: {
          create: data.exercises.map((e) => ({
            exerciseLevelId: e.exerciseLevelId,
            dayOfWeek: e.dayOfWeek,
            orderInDay: e.orderInDay,
            completionCount: 0,
            completedDates: [],
          })),
        },
      },
      include: PLAN_INCLUDE,
    }) as unknown as ActivePlan;
  }

  async findActiveByProfile(profileId: string): Promise<ActivePlan | null> {
    return this.prisma.trainingPlan.findFirst({
      where: { profileId, status: 'active' },
      include: PLAN_INCLUDE,
    }) as unknown as ActivePlan | null;
  }

  async findExercise(planExerciseId: string) {
    return this.prisma.trainingPlanExercise.findUnique({
      where: { id: planExerciseId },
      include: {
        plan: { include: PLAN_INCLUDE },
        exerciseLevel: { include: { exercise: { include: { group: true } } } },
      },
    }) as any;
  }

  async completeExercise(planExerciseId: string) {
    return this.prisma.trainingPlanExercise.update({
      where: { id: planExerciseId },
      data: {
        completionCount: { increment: 1 },
        completedDates: { push: new Date() },
      },
    });
  }

  async findGroupNamesByNumbers(groupNumbers: number[]): Promise<Array<{ name: string }>> {
    return this.prisma.exerciseGroup.findMany({
      where: { groupNumber: { in: groupNumbers } },
      select: { name: true },
    });
  }
}
