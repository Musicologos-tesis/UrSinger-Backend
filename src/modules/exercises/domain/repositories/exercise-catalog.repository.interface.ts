export interface ExerciseLevelData {
  level: number;
  description: string;
  videoUrl: string | null;
}

export interface ExerciseData {
  exerciseNumber: number;
  name: string;
  rationale: string;
  cvtDescription: string | null;
  evmDescription: string | null;
  objective: string;
  instructions: string;
  levels: ExerciseLevelData[];
}

export interface ExerciseGroupData {
  groupNumber: number;
  name: string;
  objective: string;
  rationale: string;
  exercises: ExerciseData[];
}

export interface IExerciseCatalogRepository {
  findAll(): Promise<ExerciseGroupData[]>;
}

export const EXERCISE_CATALOG_REPOSITORY = Symbol('IExerciseCatalogRepository');
