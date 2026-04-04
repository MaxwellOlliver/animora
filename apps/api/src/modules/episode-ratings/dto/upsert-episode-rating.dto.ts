import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpsertEpisodeRatingDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsEnum(['like', 'dislike'])
  value: 'like' | 'dislike';
}
