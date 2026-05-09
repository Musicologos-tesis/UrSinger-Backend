export class MLPrediction {
  constructor(
    public readonly weaknessesDetected: string[],
    public readonly totalWeaknesses: number,
    public readonly confidenceScores: Record<string, number>,
    public readonly groupMetrics: Record<string, unknown>,
  ) {}

  get weaknessGroups(): string[] {
    return this.weaknessesDetected.map((w) => w.replace('weak_', ''));
  }
}
