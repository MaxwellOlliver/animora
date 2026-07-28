import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';

import { type SeasonName, SEASONS } from '../season.util';

export class GetSeasonQueryDto {
  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ example: 'summer', enum: SEASONS })
  @IsIn(SEASONS)
  season: SeasonName;
}
