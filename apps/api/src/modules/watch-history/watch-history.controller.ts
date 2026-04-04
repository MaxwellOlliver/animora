import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { UpsertWatchProgressDto } from './dto/upsert-watch-progress.dto';
import { GetContinueWatchingUseCase } from './use-cases/get-continue-watching.use-case';
import { GetEpisodeWatchHistoryUseCase } from './use-cases/get-episode-watch-history.use-case';
import { GetWatchHistoryUseCase } from './use-cases/get-watch-history.use-case';
import { UpsertWatchProgressUseCase } from './use-cases/upsert-watch-progress.use-case';

@ApiTags('Watch History')
@ApiBearerAuth()
@UseGuards(ActiveProfileGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(
    private readonly upsertWatchProgressUseCase: UpsertWatchProgressUseCase,
    private readonly getWatchHistoryUseCase: GetWatchHistoryUseCase,
    private readonly getContinueWatchingUseCase: GetContinueWatchingUseCase,
    private readonly getEpisodeWatchHistoryUseCase: GetEpisodeWatchHistoryUseCase,
  ) {}

  @Put()
  @ApiOperation({ summary: 'Upsert watch progress for an episode' })
  async upsertProgress(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Body() dto: UpsertWatchProgressDto,
  ) {
    return this.upsertWatchProgressUseCase.execute({
      profileId: activeProfile.id,
      episodeId: dto.episodeId,
      positionSeconds: dto.positionSeconds,
      status: dto.status,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List paginated watch history for a profile' })
  async list(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getWatchHistoryUseCase.execute({
      profileId: activeProfile.id,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('continue')
  @ApiOperation({
    summary: 'Continue watching — latest episode per series',
  })
  async continueWatching(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getContinueWatchingUseCase.execute({
      profileId: activeProfile.id,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('episode/:episodeId')
  @ApiOperation({ summary: 'Get watch history for a single episode' })
  async getEpisodeWatchHistory(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.getEpisodeWatchHistoryUseCase.execute({
      profileId: activeProfile.id,
      episodeId,
    });
  }
}
