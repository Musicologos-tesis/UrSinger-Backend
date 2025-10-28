import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RoomSummaryDto {
  @IsNumber() noiseFloorDbfs: number;
  @IsNumber() snrDb: number;
}

export class FinishCalibrationDto {
  @IsString() sessionId: string;
  @IsNumber() observedRmsDb: number;
  @IsNumber() clipEvents: number;
  @IsNumber() latencyMs: number;
  @IsOptional() @IsNumber() tunerOffsetCents?: number;
  @ValidateNested() @Type(() => RoomSummaryDto) room: RoomSummaryDto;
}