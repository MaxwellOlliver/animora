import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function toUniqueIds(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : [value];
  const ids = raw.flatMap((v) => String(v).split(','));
  return [...new Set(ids.map((v) => v.trim()).filter((v) => v.length > 0))];
}

export class ExploreSeriesQueryDto {
  @ApiPropertyOptional({
    description: 'Search text matched against title and synopsis',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Selected genre (category) ids, repeated or comma-separated',
  })
  @Transform(({ value }) => toUniqueIds(value))
  @IsUUID('all', { each: true })
  @ArrayMaxSize(20)
  categoryIds: string[] = [];

  @ApiPropertyOptional({
    type: [String],
    description:
      'Selected content classification ids, repeated or comma-separated',
  })
  @Transform(({ value }) => toUniqueIds(value))
  @IsUUID('all', { each: true })
  @ArrayMaxSize(10)
  classifications: string[] = [];

  @ApiPropertyOptional({
    description: 'Opaque pagination cursor returned by the previous request',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
