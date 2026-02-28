import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: 'My Profile' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  avatarId: string;
}
