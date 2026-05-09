export interface EvaluationMetricsSnapshot {
  precisionCents: number;
  stabilityCents: number;
  dynamicRangeDb: number;
  attackLatencyMs: number;
  rangeSpanSemitones: number;
}

export interface PerformanceScores {
  intonation: number;
  stability: number;
  dynamics: number;
  overall: number;
}

export type Trend = 'improving' | 'stable' | 'declining';

export class EvaluationAnalysisService {
  buildScores(metrics: EvaluationMetricsSnapshot): PerformanceScores {
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    const intonation = Math.round(clamp(100 - metrics.precisionCents * 2));
    const stability = Math.round(clamp(100 - metrics.stabilityCents * 2));
    const dynamics = Math.round(clamp(metrics.dynamicRangeDb * 5));
    const overall = Math.round((intonation + stability + dynamics) / 3);
    return { intonation, stability, dynamics, overall };
  }

  resolveTrend(latest: EvaluationMetricsSnapshot, previous: EvaluationMetricsSnapshot): Trend {
    const latestScores = this.buildScores(latest);
    const previousScores = this.buildScores(previous);
    const round2 = (v: number) => Math.round(v * 100) / 100;

    const improvements = [
      latest.rangeSpanSemitones > previous.rangeSpanSemitones,
      latest.dynamicRangeDb > previous.dynamicRangeDb,
      latestScores.overall > previousScores.overall,
      latest.precisionCents < previous.precisionCents,
      latest.stabilityCents < previous.stabilityCents,
      latest.attackLatencyMs < previous.attackLatencyMs,
    ];

    const better = improvements.filter(Boolean).length;
    const worse = improvements.filter((v) => !v).length;

    if (better > worse) return 'improving';
    if (worse > better) return 'declining';
    return 'stable';
  }

  buildDelta(latest: EvaluationMetricsSnapshot, previous: EvaluationMetricsSnapshot) {
    const round2 = (v: number) => Math.round(v * 100) / 100;
    return {
      rangeSpanSemitones: round2(latest.rangeSpanSemitones - previous.rangeSpanSemitones),
      precisionCents: round2(latest.precisionCents - previous.precisionCents),
      stabilityCents: round2(latest.stabilityCents - previous.stabilityCents),
      dynamicRangeDb: round2(latest.dynamicRangeDb - previous.dynamicRangeDb),
      attackLatencyMs: round2(latest.attackLatencyMs - previous.attackLatencyMs),
      overallScore: round2(this.buildScores(latest).overall - this.buildScores(previous).overall),
    };
  }
}
