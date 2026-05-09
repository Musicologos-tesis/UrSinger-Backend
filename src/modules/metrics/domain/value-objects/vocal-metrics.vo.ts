export class VocalMetrics {
  constructor(
    public readonly gender: string,
    public readonly meanRmsDb: number,
    public readonly rmsConsistency: number,
    public readonly dynamicRangeDb: number,
    public readonly durationSec: number,
    public readonly precisionCents: number,
    public readonly stabilityCents: number,
    public readonly rangeMinMidi: number,
    public readonly rangeMaxMidi: number,
    public readonly rangeSpanSemitones: number,
    public readonly attackLatencyMs: number,
  ) {}
}
