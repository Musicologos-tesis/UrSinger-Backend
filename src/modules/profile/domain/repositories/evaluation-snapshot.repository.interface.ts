export interface EvaluationSnapshot {
  id: string;
  sessionId: string;
  createdAt: Date;
  rangeMinMidi: number;
  rangeMaxMidi: number;
  rangeSpanSemitones: number;
  precisionCents: number;
  stabilityCents: number;
  dynamicRangeDb: number;
  attackLatencyMs: number;
  weaknessesDetected: string[];
}

export interface IEvaluationSnapshotRepository {
  findLatestTwoByProfile(profileId: string): Promise<EvaluationSnapshot[]>;
}

export const EVALUATION_SNAPSHOT_REPOSITORY = Symbol('IEvaluationSnapshotRepository');
