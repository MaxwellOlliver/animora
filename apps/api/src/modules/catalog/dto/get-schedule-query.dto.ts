import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetScheduleQueryDto {
  @ApiProperty({ example: '2026-07-24' })
  @IsDateString()
  from: string;

  @ApiProperty({ example: '2026-07-30' })
  @IsDateString()
  to: string;
}
