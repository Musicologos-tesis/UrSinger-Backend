import { IExerciseCatalogRepository } from '../../domain/repositories/exercise-catalog.repository.interface';

export class GetExerciseCatalogUseCase {
  constructor(private readonly repo: IExerciseCatalogRepository) {}

  async execute() {
    const groups = await this.repo.findAll();
    return {
      totalGroups: groups.length,
      totalExercises: groups.reduce((sum, g) => sum + g.exercises.length, 0),
      totalLevels: groups.reduce((sum, g) => sum + g.exercises.reduce((s, e) => s + e.levels.length, 0), 0),
      groups,
    };
  }
}
