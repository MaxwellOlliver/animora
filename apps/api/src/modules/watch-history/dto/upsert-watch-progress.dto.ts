import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

export class UpsertWatchProgressDto {
  @ApiProperty()
  @IsUUID()
  episodeId: string;

  @ApiProperty({ description: 'Current playback position in seconds' })
  @IsInt()
  @Min(0)
  positionSeconds: number;

  @ApiProperty({ enum: ['watching', 'finished'] })
  @IsEnum(['watching', 'finished'])
  status: 'watching' | 'finished';
}
