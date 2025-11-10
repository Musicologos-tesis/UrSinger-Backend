import { IsString } from 'class-validator';

export class FinalizeMetricsDto {
  @IsString()
  sessionId: string;

  @IsString()
  userId: string;
}
