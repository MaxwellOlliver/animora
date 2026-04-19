import { IsInt, Min } from 'class-validator';

export class PlaybackSeekDto {
  @IsInt()
  @Min(0)
  position!: number;
}
