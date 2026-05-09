export interface LatestEvaluationData {
  id: string;
  weaknessesDetected: string[];
}

export interface IEvaluationReadRepository {
  findLatestByProfile(profileId: string): Promise<LatestEvaluationData | null>;
  profileExists(profileId: string): Promise<boolean>;
}

export const EVALUATION_READ_REPOSITORY = Symbol('IEvaluationReadRepository');
