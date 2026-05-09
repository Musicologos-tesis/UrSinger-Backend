import { IsEmail, IsString, IsInt, Min, Max, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ example: 25, minimum: 5, maximum: 120 })
  @IsInt()
  @Min(5)
  @Max(120)
  age: number;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsString()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyTrainingFreq: number;
}
