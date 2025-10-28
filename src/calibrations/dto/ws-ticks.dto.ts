import { IsString, IsNumber, IsInt, IsIn, IsOptional } from 'class-validator';

export class RoomCheckTickDto {
  @IsString() sessionId: string;
  @IsNumber() noiseFloorDbfs: number;
  @IsNumber() baseLatencyMs: number;
  @IsNumber() durationSec: number;
}

export class GainTickDto {
  @IsString() sessionId: string;
  @IsInt() windowMs: number;
  @IsNumber() avgRmsDb: number;
  @IsNumber() stdRmsDb: number;
  @IsNumber() clipRate: number;
}

export class MetricsTickDto {
  @IsString() sessionId: string;
  @IsInt() windowMs: number;
  @IsNumber() avgRmsDb: number;
  @IsNumber() stdRmsDb: number;
  @IsNumber() clipRate: number;
  @IsOptional() @IsNumber() snrDb?: number;
  @IsOptional() @IsNumber() baseLatencyMs?: number;
  @IsOptional() @IsString() result?: 'OK' | 'Fail';
}