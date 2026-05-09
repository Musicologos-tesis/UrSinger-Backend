import { IsString, IsInt, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalibrationDto {
  @ApiProperty({ example: 'clx123profileId' })
  @IsString()
  profileId: string;

  @ApiProperty({ example: 'session-uuid-123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: 'mic-device-hash-xyz' })
  @IsString()
  deviceIdHash: string;

  @ApiProperty({ example: 44100, enum: [44100, 48000] })
  @IsInt()
  @Min(44100)
  sampleRate: number;

  @ApiProperty({ example: -55.0 })
  @IsNumber()
  noiseFloorDbfs: number;

  @ApiProperty({ example: 45.2, required: false })
  @IsOptional()
  @IsNumber()
  snrDb?: number;
}
