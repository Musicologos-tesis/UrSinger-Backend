import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CompleteExerciseDto {
  @ApiProperty({ description: 'ID del ejercicio del plan (TrainingPlanExercise)', example: 'clxyz123abc456' })
  @IsString()
  @IsNotEmpty()
  planExerciseId: string;
}
