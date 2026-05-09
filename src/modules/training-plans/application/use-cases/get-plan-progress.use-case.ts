import { ITrainingPlanRepository } from '../../domain/repositories/training-plan.repository.interface';
import { NoActivePlanException } from '../../domain/exceptions/no-active-plan.exception';
import { calculateCurrentWeek } from './get-active-plan.use-case';

export class GetPlanProgressUseCase {
  constructor(private readonly planRepo: ITrainingPlanRepository) {}

  async execute(profileId: string) {
    const plan = await this.planRepo.findActiveByProfile(profileId);
    if (!plan) throw new NoActivePlanException(profileId);

    const currentWeek = calculateCurrentWeek(plan);
    const totalExercises = plan.exercises.length;
    const totalPossibleCompletions = totalExercises * 4;
    const totalCompletions = plan.exercises.reduce((sum, e) => sum + e.completionCount, 0);
    const monthlyProgressPercentage = Math.round((totalCompletions / totalPossibleCompletions) * 100);
    const uniqueExercisesStarted = plan.exercises.filter((e) => e.completionCount > 0).length;
    const completedThisWeek = plan.exercises.filter((e) => e.completionCount >= currentWeek).length;
    const pendingToAdvance = totalExercises - completedThisWeek;
    const daysSinceStart = Math.floor((Date.now() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const calendarWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 4);

    return {
      planId: plan.id,
      totalCompletions,
      totalPossibleCompletions,
      monthlyProgressPercentage,
      currentWeek,
      calendarWeek,
      isBlocked: currentWeek < calendarWeek,
      completedThisWeek,
      pendingToAdvance,
      totalExercises,
      uniqueExercisesStarted,
      startDate: plan.startDate,
      endDate: plan.endDate,
      daysRemaining: Math.ceil((plan.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      daysSinceStart,
    };
  }
}
