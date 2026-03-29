import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class InitUploadDto {
  @ApiProperty({ example: 410 })
  @IsInt()
  @Min(1)
  totalChunks: number;
}
