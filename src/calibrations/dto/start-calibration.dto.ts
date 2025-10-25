import { IsString, IsInt, Min } from 'class-validator';

export class StartCalibrationDto {
  @IsString() sessionId: string;
  @IsString() deviceIdHash: string;
  @IsInt() @Min(8000) sampleRate: number;
  @IsString() appVersion: string;
  @IsString() osInfo: string;
}