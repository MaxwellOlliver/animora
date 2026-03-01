import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  playlistId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  number: number;

  @ApiProperty({ example: 'The Beginning' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Episode description...' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
