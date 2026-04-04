import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { UpsertEpisodeRatingDto } from './dto/upsert-episode-rating.dto';
import { DeleteEpisodeRatingUseCase } from './use-cases/delete-episode-rating.use-case';
import { UpsertEpisodeRatingUseCase } from './use-cases/upsert-episode-rating.use-case';

@ApiTags('Episode Ratings')
@ApiBearerAuth()
@UseGuards(ActiveProfileGuard)
@Controller('episodes/:episodeId/rating')
export class EpisodeRatingsController {
  constructor(
    private readonly upsertEpisodeRatingUseCase: UpsertEpisodeRatingUseCase,
    private readonly deleteEpisodeRatingUseCase: DeleteEpisodeRatingUseCase,
  ) {}

  @Put()
  @ApiOperation({ summary: 'Like or dislike an episode' })
  upsert(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: UpsertEpisodeRatingDto,
  ) {
    return this.upsertEpisodeRatingUseCase.execute({
      profileId: activeProfile.id,
      episodeId,
      value: dto.value,
    });
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an episode rating' })
  delete(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.deleteEpisodeRatingUseCase.execute({
      profileId: activeProfile.id,
      episodeId,
    });
  }
}
