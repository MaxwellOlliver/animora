import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  seriesId: string;

  @ApiProperty({
    enum: ['season', 'movie', 'special'],
    example: 'season',
  })
  @IsEnum(['season', 'movie', 'special'])
  type: 'season' | 'movie' | 'special';

  @ApiPropertyOptional({
    enum: ['upcoming', 'airing', 'finished'],
    example: 'airing',
  })
  @IsOptional()
  @IsEnum(['upcoming', 'airing', 'finished'])
  status?: 'upcoming' | 'airing' | 'finished';

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  number: number;

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

  @ApiPropertyOptional({
    description: 'Day of week new episodes release on (0=Sunday..6=Saturday)',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  releaseWeekday?: number;

  @ApiPropertyOptional({ example: '12:00' })
  @IsOptional()
  @IsMilitaryTime()
  releaseTime?: string;
}
