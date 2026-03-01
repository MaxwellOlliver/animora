import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEpisodeDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional({ example: 'The Beginning' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Episode description...' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
