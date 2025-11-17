import { IsString, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 25,
    description: 'Edad del usuario',
    minimum: 5,
    maximum: 120,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  age?: number;

  @ApiProperty({
    example: 'male',
    description: 'Género del usuario',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({
    example: 3,
    description: 'Frecuencia semanal de entrenamiento (1-7 días)',
    minimum: 1,
    maximum: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyTrainingFreq?: number;
}
