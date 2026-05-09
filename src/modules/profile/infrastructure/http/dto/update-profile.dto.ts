import { IsString, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 25, minimum: 5, maximum: 120, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  age?: number;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other', 'prefer_not_to_say'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 7, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyTrainingFreq?: number;
}
