import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePlaylistDto {
  @ApiPropertyOptional({ enum: ['season', 'movie', 'special'] })
  @IsOptional()
  @IsEnum(['season', 'movie', 'special'])
  type?: 'season' | 'movie' | 'special';

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional({ example: 'Mugen Train' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;
}
