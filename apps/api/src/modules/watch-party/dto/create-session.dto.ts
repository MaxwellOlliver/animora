import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Episode to watch together' })
  @IsUUID()
  episodeId!: string;
}
