import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class InitUploadDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  episodeId: string;

  @ApiProperty({ example: 410 })
  @IsInt()
  @Min(1)
  totalChunks: number;
}
