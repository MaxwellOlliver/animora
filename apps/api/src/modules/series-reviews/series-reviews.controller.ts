import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewUseCase } from './use-cases/create-review.use-case';
import { DeleteReviewUseCase } from './use-cases/delete-review.use-case';
import { GetMyReviewUseCase } from './use-cases/get-my-review.use-case';
import { ListSeriesReviewsUseCase } from './use-cases/list-series-reviews.use-case';
import { UpdateReviewUseCase } from './use-cases/update-review.use-case';

@ApiTags('Series Reviews')
@Controller()
export class SeriesReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly getMyReviewUseCase: GetMyReviewUseCase,
    private readonly listSeriesReviewsUseCase: ListSeriesReviewsUseCase,
  ) {}

  @Get('catalog/series/:seriesId/reviews')
  @Public()
  @ApiOperation({ summary: 'List paginated reviews for a series' })
  list(
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    return this.listSeriesReviewsUseCase.execute({
      seriesId,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('series/:seriesId/review')
  @UseGuards(ActiveProfileGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current profile review for a series' })
  myReview(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.getMyReviewUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
    });
  }

  @Post('series/:seriesId/review')
  @UseGuards(ActiveProfileGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a series' })
  create(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.createReviewUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
      rating: dto.rating,
      text: dto.text,
    });
  }

  @Patch('series/:seriesId/review')
  @UseGuards(ActiveProfileGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your review for a series' })
  update(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.updateReviewUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
      rating: dto.rating,
      text: dto.text,
    });
  }

  @Delete('series/:seriesId/review')
  @UseGuards(ActiveProfileGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete your review for a series' })
  delete(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.deleteReviewUseCase.execute({
      profileId: activeProfile.id,
      seriesId,
    });
  }
}
