import { SelectableExercise } from '../services/exercise-selection.service';

export interface IExerciseReadRepository {
  findByGroupsAndLevel(groupNumbers: number[], level: number): Promise<SelectableExercise[]>;
}

export const EXERCISE_READ_REPOSITORY = Symbol('IExerciseReadRepository');
