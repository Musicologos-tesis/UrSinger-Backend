import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn } from 'class-validator';

export class EvaluationMetricsDto {
  @ApiProperty({ description: 'ID del perfil de usuario' })
  @IsString()
  profileId: string;

  @ApiProperty({ description: 'ID de sesión de calibración' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Género del usuario', enum: ['M', 'F'] })
  @IsIn(['M', 'F'])
  gender: string;

  @ApiProperty({ description: 'Nivel promedio de volumen (dBFS)', example: -25.5 })
  @IsNumber()
  meanRmsDb: number;

  @ApiProperty({ description: 'Estabilidad del aire y soporte', example: 2.3 })
  @IsNumber()
  rmsConsistency: number;

  @ApiProperty({ description: 'Diferencia entre volumen más bajo y más alto', example: 18.2 })
  @IsNumber()
  dynamicRangeDb: number;

  @ApiProperty({ description: 'Duración efectiva de la nota', example: 4.5 })
  @IsNumber()
  durationSec: number;

  @ApiProperty({ description: 'Diferencia promedio entre pitch emitido y objetivo', example: 12.5 })
  @IsNumber()
  precisionCents: number;

  @ApiProperty({ description: 'Desviación tonal durante nota sostenida', example: 8.3 })
  @IsNumber()
  stabilityCents: number;

  @ApiProperty({ description: 'Nota más baja alcanzada (MIDI)', example: 48 })
  @IsNumber()
  rangeMinMidi: number;

  @ApiProperty({ description: 'Nota más alta alcanzada (MIDI)', example: 72 })
  @IsNumber()
  rangeMaxMidi: number;

  @ApiProperty({ description: 'Diferencia mínima-máxima en semitonos', example: 24 })
  @IsNumber()
  rangeSpanSemitones: number;

  @ApiProperty({ description: 'Tiempo entre inicio y estabilización del tono (ms)', example: 150 })
  @IsNumber()
  attackLatencyMs: number;
}
