import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Action' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
