import { IsEmail, IsString, IsInt, Min, Max, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 25,
    description: 'Edad del usuario',
    minimum: 5,
    maximum: 120,
  })
  @IsInt()
  @Min(5)
  @Max(120)
  age: number;

  @ApiProperty({
    example: 'male',
    description: 'Género del usuario',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  @IsString()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender: string;

  @ApiProperty({
    example: 3,
    description: 'Frecuencia semanal de entrenamiento (1-7 días)',
    minimum: 1,
    maximum: 7,
  })
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyTrainingFreq: number;
}
