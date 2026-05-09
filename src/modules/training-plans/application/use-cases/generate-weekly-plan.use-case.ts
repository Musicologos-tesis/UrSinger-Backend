import { ITrainingPlanRepository } from '../../domain/repositories/training-plan.repository.interface';
import { IEvaluationReadRepository } from '../../domain/repositories/evaluation-read.repository.interface';
import { IExerciseReadRepository } from '../../domain/repositories/exercise-read.repository.interface';
import { ExerciseSelectionService } from '../../domain/services/exercise-selection.service';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { NoEvaluationFoundException } from '../../domain/exceptions/no-evaluation-found.exception';

const ALL_GROUPS = [1, 2, 3, 4, 5];

export class GenerateWeeklyPlanUseCase {
  private readonly selectionService = new ExerciseSelectionService();

  constructor(
    private readonly planRepo: ITrainingPlanRepository,
    private readonly evalRepo: IEvaluationReadRepository,
    private readonly exerciseRepo: IExerciseReadRepository,
  ) {}

  async execute(profileId: string) {
    if (!(await this.evalRepo.profileExists(profileId))) {
      throw new ProfileNotFoundException(profileId);
    }

    const evaluation = await this.evalRepo.findLatestByProfile(profileId);
    if (!evaluation) throw new NoEvaluationFoundException(profileId);

    const weakGroups = evaluation.weaknessesDetected
      .map((w) => { const m = w.match(/\d+/); return m ? parseInt(m[0]) : null; })
      .filter((g): g is number => g !== null);

    await this.planRepo.replacePreviousPlans(profileId);

    const exercisesByKey = new Map<string, any[]>();
    for (const group of ALL_GROUPS) {
      for (const level of [1, 2]) {
        const exercises = await this.exerciseRepo.findByGroupsAndLevel([group], level);
        exercisesByKey.set(`${group}:${level}`, exercises);
      }
    }

    const selected = this.selectionService.buildSelection(ALL_GROUPS, weakGroups, exercisesByKey);
    const distributed = this.selectionService.distributeAcrossDays(selected);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 28);

    const plan = await this.planRepo.create({
      profileId,
      evaluationId: evaluation.id,
      startDate,
      endDate,
      frequency: 3,
      focusGroups: weakGroups,
      exercises: distributed,
    });

    const focusGroupNames = await this.planRepo.findGroupNamesByNumbers(weakGroups);

    const weekPlan = [
      { day: 1, dayName: 'Lunes', exercises: this.formatDay(plan.exercises, 1) },
      { day: 3, dayName: 'Miércoles', exercises: this.formatDay(plan.exercises, 3) },
      { day: 5, dayName: 'Viernes', exercises: this.formatDay(plan.exercises, 5) },
    ];

    return {
      planId: plan.id,
      focusGroups: focusGroupNames.map((g) => g.name),
      startDate: plan.startDate,
      endDate: plan.endDate,
      weekPlan,
      instructions: 'Repite esta misma semana durante 4 semanas consecutivas. Al finalizar el mes, realiza una nueva evaluación para ajustar tu plan.',
    };
  }

  private formatDay(exercises: any[], day: number) {
    return exercises
      .filter((e) => e.dayOfWeek === day)
      .map((e) => ({
        exerciseName: e.exerciseLevel.exercise.name,
        groupName: e.exerciseLevel.exercise.group.name,
        level: e.exerciseLevel.level,
        description: e.exerciseLevel.description,
        cvtDescription: e.exerciseLevel.exercise.cvtDescription,
        evmDescription: e.exerciseLevel.exercise.evmDescription,
      }));
  }
}
