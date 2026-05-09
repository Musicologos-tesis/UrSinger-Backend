import { VocalMetrics } from '../value-objects/vocal-metrics.vo';
import { MLPrediction } from '../value-objects/ml-prediction.vo';

export interface IMLService {
  predict(metrics: VocalMetrics): Promise<MLPrediction>;
}

export const ML_SERVICE = Symbol('IMLService');
