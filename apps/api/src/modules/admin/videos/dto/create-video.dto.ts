import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';

import type { VideoOwnerType } from '../video.entity';

export class CreateVideoDto {
  @ApiProperty({ example: 'episode', enum: ['episode', 'trailer'] })
  @IsIn(['episode', 'trailer'])
  ownerType: VideoOwnerType;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  ownerId: string;
}
