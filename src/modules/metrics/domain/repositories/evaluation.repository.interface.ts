import { VocalMetrics } from '../value-objects/vocal-metrics.vo';
import { MLPrediction } from '../value-objects/ml-prediction.vo';

export interface EvaluationRecord {
  id: string;
  profileId: string;
  sessionId: string;
  meanRmsDb: number;
  rmsConsistency: number;
  dynamicRangeDb: number;
  durationSec: number;
  precisionCents: number;
  stabilityCents: number;
  rangeMinMidi: number;
  rangeMaxMidi: number;
  rangeSpanSemitones: number;
  attackLatencyMs: number;
  weaknessesDetected: string[];
  totalWeaknesses: number;
  confidenceScores: unknown;
  groupMetrics: unknown;
  createdAt: Date;
}

export interface IEvaluationRepository {
  calibrationExists(sessionId: string): Promise<boolean>;
  profileExists(profileId: string): Promise<boolean>;
  upsert(profileId: string, sessionId: string, metrics: VocalMetrics, prediction: MLPrediction): Promise<EvaluationRecord>;
  findBySessionId(sessionId: string): Promise<EvaluationRecord | null>;
}

export const EVALUATION_REPOSITORY = Symbol('IEvaluationRepository');
