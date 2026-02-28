import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContentClassificationDto {
  @ApiProperty({ example: '+14' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'Not recommended for children under 14.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
