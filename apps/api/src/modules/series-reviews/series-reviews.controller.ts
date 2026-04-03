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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';

import type { JwtPayload } from '../auth/strategies/jwt.strategy';
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

  @Get('profiles/:profileId/series/:seriesId/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current profile review for a series' })
  myReview(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.getMyReviewUseCase.execute({
      userId: user.sub,
      profileId,
      seriesId,
    });
  }

  @Post('profiles/:profileId/series/:seriesId/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a series' })
  create(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.createReviewUseCase.execute({
      userId: user.sub,
      profileId,
      seriesId,
      rating: dto.rating,
      text: dto.text,
    });
  }

  @Patch('profiles/:profileId/series/:seriesId/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your review for a series' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.updateReviewUseCase.execute({
      userId: user.sub,
      profileId,
      seriesId,
      rating: dto.rating,
      text: dto.text,
    });
  }

  @Delete('profiles/:profileId/series/:seriesId/review')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete your review for a series' })
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('seriesId', ParseUUIDPipe) seriesId: string,
  ) {
    return this.deleteReviewUseCase.execute({
      userId: user.sub,
      profileId,
      seriesId,
    });
  }
}
