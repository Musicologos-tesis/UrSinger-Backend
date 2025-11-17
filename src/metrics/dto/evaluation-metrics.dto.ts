import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, IsUUID } from 'class-validator';

export class EvaluationMetricsDto {
  @ApiProperty({ description: 'ID del perfil de usuario' })
  @IsString()
  profileId: string;

  @ApiProperty({ description: 'ID de sesión de calibración', example: 'session-uuid' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Género del usuario', enum: ['M', 'F'] })
  @IsIn(['M', 'F'])
  gender: string;

  // === MÉTRICAS DE VOLUMEN ===
  @ApiProperty({ description: 'Nivel promedio de volumen durante la emisión', example: -25.5 })
  @IsNumber()
  meanRmsDb: number;

  @ApiProperty({ description: 'Estabilidad del aire y soporte', example: 2.3 })
  @IsNumber()
  rmsConsistency: number;

  @ApiProperty({ description: 'Diferencia entre el volumen más bajo y más alto detectado', example: 18.2 })
  @IsNumber()
  dynamicRangeDb: number;

  @ApiProperty({ description: 'Duración efectiva de la nota o del flujo de aire', example: 4.5 })
  @IsNumber()
  durationSec: number;

  // === MÉTRICAS DE AFINACIÓN ===
  @ApiProperty({ description: 'Diferencia promedio entre el pitch emitido y el objetivo', example: 12.5 })
  @IsNumber()
  precisionCents: number;

  @ApiProperty({ description: 'Desviación tonal durante una nota sostenida', example: 8.3 })
  @IsNumber()
  stabilityCents: number;

  // === MÉTRICAS DE RANGO VOCAL ===
  @ApiProperty({ description: 'Nota más baja alcanzada', example: 48 })
  @IsNumber()
  rangeMinMidi: number;

  @ApiProperty({ description: 'Nota más alta alcanzada', example: 72 })
  @IsNumber()
  rangeMaxMidi: number;

  @ApiProperty({ description: 'Diferencia entre la mínima y máxima', example: 24 })
  @IsNumber()
  rangeSpanSemitones: number;

  @ApiProperty({ description: 'Tiempo entre inicio de sonido y estabilización del tono', example: 150 })
  @IsNumber()
  attackLatencyMs: number;
}
