import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMLService } from '../../domain/services/ml.service.interface';
import { VocalMetrics } from '../../domain/value-objects/vocal-metrics.vo';
import { MLPrediction } from '../../domain/value-objects/ml-prediction.vo';
import { MLServiceUnavailableException } from '../../domain/exceptions/ml-service-unavailable.exception';

/**
 * Adaptador secundario: traduce el puerto IMLService a llamadas HTTP reales al servicio ML externo.
 * El dominio nunca sabe que existe fetch, URLs ni HTTP — solo habla con IMLService.
 */
@Injectable()
export class HttpMLServiceAdapter implements IMLService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  async predict(metrics: VocalMetrics): Promise<MLPrediction> {
    try {
      const healthResponse = await fetch(`${this.baseUrl}/health`);
      if (!healthResponse.ok) throw new MLServiceUnavailableException();

      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' } as any,
        body: JSON.stringify({
          gender: metrics.gender,
          meanRmsDb: metrics.meanRmsDb,
          rmsConsistency: metrics.rmsConsistency,
          dynamicRangeDb: metrics.dynamicRangeDb,
          durationSec: metrics.durationSec,
          precisionCents: metrics.precisionCents,
          stabilityCents: metrics.stabilityCents,
          rangeMinMidi: metrics.rangeMinMidi,
          rangeMaxMidi: metrics.rangeMaxMidi,
          rangeSpanSemitones: metrics.rangeSpanSemitones,
          attackLatencyMs: metrics.attackLatencyMs,
        }),
      });

      if (!response.ok) {
        throw new MLServiceUnavailableException();
      }

      const raw = await response.json();
      console.log('ML Service Response:', JSON.stringify(raw, null, 2));

      const groupMetrics: Record<string, unknown> =
        raw.group_metrics && typeof raw.group_metrics === 'object' ? raw.group_metrics : {};

      const weaknessesDetected: string[] =
        Array.isArray(raw.weaknesses_detected) && raw.weaknesses_detected.length > 0
          ? raw.weaknesses_detected
          : this.extractWeaknessesFromGroupMetrics(groupMetrics);

      const totalWeaknesses =
        typeof raw.total_weaknesses === 'number' ? raw.total_weaknesses : weaknessesDetected.length;

      return new MLPrediction(
        weaknessesDetected,
        totalWeaknesses,
        raw.confidence_scores || {},
        groupMetrics,
      );
    } catch (e) {
      if (e instanceof MLServiceUnavailableException) throw e;
      throw new MLServiceUnavailableException();
    }
  }

  private extractWeaknessesFromGroupMetrics(groupMetrics: Record<string, unknown>): string[] {
    return Object.entries(groupMetrics)
      .filter(([, m]) => m && typeof m === 'object' && (m as { is_weak?: boolean }).is_weak === true)
      .map(([group]) => `weak_${group}`);
  }
}
