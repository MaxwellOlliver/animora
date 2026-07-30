import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, Min, ValidateNested } from 'class-validator';

import {
  EPISODE_TIMESTAMP_TYPES,
  type EpisodeTimestampType,
} from '../episode-timestamp.entity';

export class TimestampSegmentDto {
  @ApiProperty({ enum: EPISODE_TIMESTAMP_TYPES })
  @IsIn(EPISODE_TIMESTAMP_TYPES)
  type: EpisodeTimestampType;

  @ApiProperty({ example: 30, description: 'Start time in seconds' })
  @IsInt()
  @Min(0)
  startSeconds: number;

  @ApiProperty({ example: 118, description: 'End time in seconds' })
  @IsInt()
  @Min(0)
  endSeconds: number;
}

export class SetEpisodeTimestampsDto {
  @ApiProperty({ type: [TimestampSegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimestampSegmentDto)
  timestamps: TimestampSegmentDto[];
}
