import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  techniqueId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  duration: number;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsString()
  pitchRange: string; // JSON string

  @IsString()
  dynamicRange: string; // JSON string

  @IsString()
  targetMetrics: string; // JSON string

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  sheetMusic?: string;

  @IsString()
  instructions: string;
}