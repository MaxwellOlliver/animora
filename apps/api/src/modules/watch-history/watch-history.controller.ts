import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';

import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpsertWatchProgressDto } from './dto/upsert-watch-progress.dto';
import { GetContinueWatchingUseCase } from './use-cases/get-continue-watching.use-case';
import { GetEpisodeWatchHistoryUseCase } from './use-cases/get-episode-watch-history.use-case';
import { GetWatchHistoryUseCase } from './use-cases/get-watch-history.use-case';
import { UpsertWatchProgressUseCase } from './use-cases/upsert-watch-progress.use-case';

@ApiTags('Watch History')
@ApiBearerAuth()
@Controller('profiles/:profileId/watch-history')
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
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() dto: UpsertWatchProgressDto,
  ) {
    return this.upsertWatchProgressUseCase.execute({
      userId: user.sub,
      profileId,
      episodeId: dto.episodeId,
      positionSeconds: dto.positionSeconds,
      status: dto.status,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List paginated watch history for a profile' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getWatchHistoryUseCase.execute({
      userId: user.sub,
      profileId,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('continue')
  @ApiOperation({
    summary: 'Continue watching — latest episode per series',
  })
  async continueWatching(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.getContinueWatchingUseCase.execute({
      userId: user.sub,
      profileId,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('episode/:episodeId')
  @ApiOperation({ summary: 'Get watch history for a single episode' })
  async getEpisodeWatchHistory(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.getEpisodeWatchHistoryUseCase.execute({
      userId: user.sub,
      profileId,
      episodeId,
    });
  }
}
