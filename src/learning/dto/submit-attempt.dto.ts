import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class SubmitExerciseAttemptDto {
  @IsString()
  userId: string;

  @IsString()
  exerciseId: string;

  @IsString()
  progressId: string;

  @IsOptional()
  @IsNumber()
  pitchAccuracy?: number;

  @IsOptional()
  @IsNumber()
  stability?: number;

  @IsOptional()
  @IsNumber()
  vibratoRate?: number;

  @IsOptional()
  @IsNumber()
  vibratoDepth?: number;

  @IsOptional()
  @IsNumber()
  dynamicControl?: number;

  @IsOptional()
  @IsNumber()
  techniqueScore?: number;

  @IsOptional()
  @IsString()
  feedback?: string; // JSON string

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsNumber()
  duration: number;

  @IsBoolean()
  completed: boolean;
}