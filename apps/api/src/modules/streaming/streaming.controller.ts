import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

import { GetWatchEpisodeUseCase } from './use-cases/get-watch-episode.use-case';

@ApiTags('Streaming')
@Controller('streaming')
export class StreamingController {
  constructor(
    private readonly getWatchEpisodeUseCase: GetWatchEpisodeUseCase,
  ) {}

  @Public()
  @Get('watch/:episodeId')
  @ApiOperation({
    summary: 'Get episode watch payload including media and video',
  })
  async getWatchEpisode(
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.getWatchEpisodeUseCase.execute(episodeId);
  }
}
