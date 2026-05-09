import { ITrainingPlanRepository } from '../../domain/repositories/training-plan.repository.interface';
import { ExerciseNotFoundException } from '../../domain/exceptions/exercise-not-found.exception';
import { calculateCurrentWeek } from './get-active-plan.use-case';

export class GetPlanExerciseUseCase {
  constructor(private readonly planRepo: ITrainingPlanRepository) {}

  async execute(planExerciseId: string) {
    const planExercise = await this.planRepo.findExercise(planExerciseId);
    if (!planExercise) throw new ExerciseNotFoundException(planExerciseId);

    const currentWeek = calculateCurrentWeek(planExercise.plan);
    const el = planExercise.exerciseLevel;

    return {
      planExerciseId: planExercise.id,
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
      completionCount: planExercise.completionCount,
      completedDates: planExercise.completedDates,
      isCompletedThisWeek: planExercise.completionCount >= currentWeek,
      dayOfWeek: planExercise.dayOfWeek,
      orderInDay: planExercise.orderInDay,
    };
  }
}
