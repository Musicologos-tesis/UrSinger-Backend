import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GeneratePlanDto {
  @ApiProperty({
    description: 'ID del perfil del usuario',
    example: 'clxyz123abc456',
  })
  @IsString()
  @IsNotEmpty()
  profileId: string;
}
