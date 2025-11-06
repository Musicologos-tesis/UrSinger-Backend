import { IsString, IsNumber, IsOptional, Min, IsInt } from 'class-validator';

export class StabilityMetricsDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  precisionCents: number;

  @IsNumber()
  stabilityCents: number;

  @IsOptional()
  @IsNumber()
  vibratoRateHz?: number;

  @IsOptional()
  @IsNumber()
  vibratoDepthCents?: number;

  @IsOptional()
  @IsNumber()
  meanRmsDb?: number;

  @IsOptional()
  @IsNumber()
  rmsConsistency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSeconds?: number;

  // === Nuevas métricas ML (específicas de ESTABILIDAD) ===
  @IsOptional()
  @IsNumber()
  spectralCentroid?: number; // Brillo de la nota sostenida

  @IsOptional()
  @IsNumber()
  dynamicRangeDb?: number; // Variación de volumen (idealmente mínima en estabilidad)
}
