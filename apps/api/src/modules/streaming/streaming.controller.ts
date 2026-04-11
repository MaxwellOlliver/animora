import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { GetWatchEpisodeUseCase } from './use-cases/get-watch-episode.use-case';

@ApiTags('Streaming')
@Controller()
export class StreamingController {
  constructor(
    private readonly getWatchEpisodeUseCase: GetWatchEpisodeUseCase,
  ) {}

  @Get('streaming/watch/:episodeId')
  @UseGuards(ActiveProfileGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get episode watch payload including media, video, and rating data',
  })
  async getWatchEpisode(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.getWatchEpisodeUseCase.execute({
      episodeId,
      profileId: activeProfile.id,
    });
  }
}
