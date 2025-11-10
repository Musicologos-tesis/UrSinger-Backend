import { IsString, IsInt, IsArray, IsJSON, Min, Max } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  techniqueId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  @Max(3)
  level: number;

  @IsInt()
  orderIndex: number;

  @IsArray()
  prerequisites: string[];

  @IsString()
  techniqueMode: string;

  @IsJSON()
  pitchRange: string; // JSON string: { minMidi: number, maxMidi: number }

  @IsJSON()
  dynamicRange: string; // JSON string: { minDb: number, maxDb: number }
}