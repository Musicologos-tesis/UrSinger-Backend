import { IsString, IsNumber, IsOptional, Min, IsInt } from 'class-validator';

export class RangeMetricsDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  @Min(0)
  rangeSpanSemitones: number;

  @IsNumber()
  rangeMinMidi: number;

  @IsNumber()
  rangeMaxMidi: number;

  @IsOptional()
  @IsNumber()
  meanRmsDb?: number;

  @IsOptional()
  @IsNumber()
  rmsConsistency?: number;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  // === Nuevas métricas ML (específicas de RANGO) ===
  @IsOptional()
  @IsString()
  voiceType?: string; // soprano | alto | tenor | bass (calculado del rango)

  @IsOptional()
  @IsNumber()
  tessituraCenterMidi?: number; // Nota más cómoda mientras explora el rango

  @IsOptional()
  @IsNumber()
  spectralCentroid?: number; // Brillo promedio del sonido

  @IsOptional()
  @IsNumber()
  dynamicRangeDb?: number; // Variación de volumen durante el ejercicio

  @IsOptional()
  @IsInt()
  registerShifts?: number; // Cambios de registro al subir/bajar notas
}
