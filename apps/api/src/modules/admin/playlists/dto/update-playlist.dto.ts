import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
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

  @ApiPropertyOptional({ enum: ['upcoming', 'airing', 'finished'] })
  @IsOptional()
  @IsEnum(['upcoming', 'airing', 'finished'])
  status?: 'upcoming' | 'airing' | 'finished';

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

  @ApiPropertyOptional({ example: 'MAPPA' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  studio?: string;

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  airStartDate?: string;

  @ApiPropertyOptional({ example: '2025-09-30' })
  @IsOptional()
  @IsDateString()
  airEndDate?: string;
}
