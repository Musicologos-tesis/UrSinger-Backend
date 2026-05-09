import { ITrainingPlanRepository } from '../../domain/repositories/training-plan.repository.interface';
import { ExerciseNotFoundException } from '../../domain/exceptions/exercise-not-found.exception';

export class CompleteExerciseUseCase {
  constructor(private readonly planRepo: ITrainingPlanRepository) {}

  async execute(planExerciseId: string) {
    const exercise = await this.planRepo.findExercise(planExerciseId);
    if (!exercise) throw new ExerciseNotFoundException(planExerciseId);
    const updated = await this.planRepo.completeExercise(planExerciseId);
    return {
      success: true,
      exerciseId: updated.id,
      completionCount: updated.completionCount,
      completedDates: updated.completedDates,
    };
  }
}
