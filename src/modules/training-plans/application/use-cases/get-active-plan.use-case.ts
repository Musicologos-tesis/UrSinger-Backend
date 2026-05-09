import { ITrainingPlanRepository, ActivePlan } from '../../domain/repositories/training-plan.repository.interface';
import { NoActivePlanException } from '../../domain/exceptions/no-active-plan.exception';

export function calculateCurrentWeek(plan: ActivePlan): number {
  const daysSinceStart = Math.floor((Date.now() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const calendarWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 4);

  let actualWeek = 1;
  for (let week = 1; week <= calendarWeek; week++) {
    const allCompleted = plan.exercises.every((ex) => ex.completionCount >= week);
    if (allCompleted) actualWeek = Math.min(week + 1, 4);
    else break;
  }
  return actualWeek;
}

export class GetActivePlanUseCase {
  constructor(private readonly planRepo: ITrainingPlanRepository) {}

  async execute(profileId: string) {
    const plan = await this.planRepo.findActiveByProfile(profileId);
    if (!plan) throw new NoActivePlanException(profileId);

    const currentWeek = calculateCurrentWeek(plan);
    const completedThisWeek = plan.exercises.filter((e) => e.completionCount >= currentWeek).length;
    const focusGroupNames = await this.planRepo.findGroupNamesByNumbers(plan.focusGroups);

    const weekPlan = [
      { day: 1, dayName: 'Lunes', exercises: this.formatDay(plan.exercises, 1, currentWeek) },
      { day: 3, dayName: 'Miércoles', exercises: this.formatDay(plan.exercises, 3, currentWeek) },
      { day: 5, dayName: 'Viernes', exercises: this.formatDay(plan.exercises, 5, currentWeek) },
    ];

    return {
      planId: plan.id,
      frequency: plan.frequency,
      focusGroups: focusGroupNames.map((g) => g.name),
      startDate: plan.startDate,
      endDate: plan.endDate,
      currentWeek,
      completedThisWeek,
      totalExercises: 9,
      weekPlan,
    };
  }

  private formatDay(exercises: any[], day: number, currentWeek: number) {
    return exercises
      .filter((e) => e.dayOfWeek === day)
      .map((e) => ({
        planExerciseId: e.id,
        exerciseLevelId: e.exerciseLevel.id,
        exerciseId: e.exerciseLevel.exercise.id,
        exerciseName: e.exerciseLevel.exercise.name,
        groupNumber: e.exerciseLevel.exercise.group.groupNumber,
        groupName: e.exerciseLevel.exercise.group.name,
        level: e.exerciseLevel.level,
        description: e.exerciseLevel.description,
        instructions: e.exerciseLevel.exercise.instructions,
        videoUrl: e.exerciseLevel.videoUrl,
        cvtDescription: e.exerciseLevel.exercise.cvtDescription,
        evmDescription: e.exerciseLevel.exercise.evmDescription,
        completionCount: e.completionCount,
        completedDates: e.completedDates,
        isCompletedThisWeek: e.completionCount >= currentWeek,
      }));
  }
}
