import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalibrationDto {
  @ApiProperty({
    example: 'clx123profileId',
    description: 'ID del perfil del usuario',
  })
  @IsString()
  profileId: string;

  @ApiProperty({
    example: 'session-uuid-123',
    description: 'ID de sesión único generado en frontend',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    example: 'mic-device-hash-xyz',
    description: 'Hash identificador del micrófono',
  })
  @IsString()
  deviceIdHash: string;

  @ApiProperty({
    example: 44100,
    description: 'Sample rate del audio (44100 o 48000)',
    enum: [44100, 48000],
  })
  @IsInt()
  @Min(44100)
  sampleRate: number;

  @ApiProperty({
    example: -55.0,
    description: 'Piso de ruido medido en dBFS',
  })
  @IsNumber()
  noiseFloorDbfs: number;

  @ApiProperty({
    example: 45.2,
    description: 'Signal-to-Noise Ratio en dB (opcional)',
    required: false,
  })
  @IsNumber()
  snrDb?: number;
}
