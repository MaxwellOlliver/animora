import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { GetWatchLaterStatusUseCase } from './use-cases/get-watch-later-status.use-case';
import { ListWatchLaterUseCase } from './use-cases/list-watch-later.use-case';
import { MarkWatchLaterUseCase } from './use-cases/mark-watch-later.use-case';
import { UnmarkWatchLaterUseCase } from './use-cases/unmark-watch-later.use-case';

@ApiTags('Watch Later')
@ApiBearerAuth()
@UseGuards(ActiveProfileGuard)
@Controller('watch-later')
export class WatchLaterController {
  constructor(
    private readonly markWatchLaterUseCase: MarkWatchLaterUseCase,
    private readonly unmarkWatchLaterUseCase: UnmarkWatchLaterUseCase,
    private readonly getWatchLaterStatusUseCase: GetWatchLaterStatusUseCase,
    private readonly listWatchLaterUseCase: ListWatchLaterUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List paginated watch-later series for the current profile',
  })
  list(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.listWatchLaterUseCase.execute({
      profileId: activeProfile.id,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get(':seriesId')
  @ApiOperation({
    summary: 'Check whether a series is in the watch-later list',
  })
  status(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.getWatchLaterStatusUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
    });
  }

  @Post(':seriesId')
  @ApiOperation({ summary: 'Mark a series as watch later' })
  mark(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.markWatchLaterUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
    });
  }

  @Delete(':seriesId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unmark a series as watch later' })
  unmark(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.unmarkWatchLaterUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
    });
  }
}
