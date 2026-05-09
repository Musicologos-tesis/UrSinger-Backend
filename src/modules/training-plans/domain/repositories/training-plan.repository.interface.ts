export interface PlanExerciseRow {
  id: string;
  dayOfWeek: number;
  orderInDay: number;
  completionCount: number;
  completedDates: Date[];
  exerciseLevel: {
    id: number;
    level: number;
    description: string;
    videoUrl: string | null;
    exercise: {
      id: number;
      name: string;
      instructions: string;
      cvtDescription: string | null;
      evmDescription: string | null;
      group: { groupNumber: number; name: string };
    };
  };
}

export interface ActivePlan {
  id: string;
  profileId: string;
  frequency: number;
  focusGroups: number[];
  startDate: Date;
  endDate: Date;
  status: string;
  exercises: PlanExerciseRow[];
}

export interface CreatePlanData {
  profileId: string;
  evaluationId: string;
  startDate: Date;
  endDate: Date;
  frequency: number;
  focusGroups: number[];
  exercises: Array<{ exerciseLevelId: number; dayOfWeek: number; orderInDay: number }>;
}

export interface ITrainingPlanRepository {
  replacePreviousPlans(profileId: string): Promise<void>;
  create(data: CreatePlanData): Promise<ActivePlan>;
  findActiveByProfile(profileId: string): Promise<ActivePlan | null>;
  findExercise(planExerciseId: string): Promise<(PlanExerciseRow & { plan: ActivePlan }) | null>;
  completeExercise(planExerciseId: string): Promise<{ id: string; completionCount: number; completedDates: Date[] }>;
  findGroupNamesByNumbers(groupNumbers: number[]): Promise<Array<{ name: string }>>;
}

export const TRAINING_PLAN_REPOSITORY = Symbol('ITrainingPlanRepository');
