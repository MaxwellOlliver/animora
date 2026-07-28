import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { GetScheduleQueryDto } from './dto/get-schedule-query.dto';
import { GetSeasonQueryDto } from './dto/get-season-query.dto';
import { GetPlaylistEpisodesUseCase } from './use-cases/get-playlist-episodes.use-case';
import { GetRecommendedUseCase } from './use-cases/get-recommended.use-case';
import { GetScheduleUseCase } from './use-cases/get-schedule.use-case';
import { GetSeasonUseCase } from './use-cases/get-season.use-case';
import { GetSeriesDetailUseCase } from './use-cases/get-series-detail.use-case';
import { GetSeriesFeaturedTrailerUseCase } from './use-cases/get-series-featured-trailer.use-case';
import { GetSeriesPlaylistsUseCase } from './use-cases/get-series-playlists.use-case';
import { GetSeriesTrailersUseCase } from './use-cases/get-series-trailers.use-case';

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly getRecommendedUseCase: GetRecommendedUseCase,
    private readonly getSeriesDetailUseCase: GetSeriesDetailUseCase,
    private readonly getSeriesPlaylistsUseCase: GetSeriesPlaylistsUseCase,
    private readonly getPlaylistEpisodesUseCase: GetPlaylistEpisodesUseCase,
    private readonly getSeriesTrailersUseCase: GetSeriesTrailersUseCase,
    private readonly getSeriesFeaturedTrailerUseCase: GetSeriesFeaturedTrailerUseCase,
    private readonly getScheduleUseCase: GetScheduleUseCase,
    private readonly getSeasonUseCase: GetSeasonUseCase,
  ) {}

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended series' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  recommended(
    @Query('cursor', new ParseUUIDPipe({ optional: true })) cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.getRecommendedUseCase.execute({ cursor, limit });
  }

  @Get('series/:id')
  @ApiOperation({ summary: 'Get series detail for catalog page' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSeriesDetailUseCase.execute(id);
  }

  @Get('series/:id/playlists')
  @ApiOperation({ summary: 'Get playlists for a series' })
  playlists(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSeriesPlaylistsUseCase.execute(id);
  }

  @Get('series/:id/trailers')
  @ApiOperation({ summary: 'Get trailers for a series' })
  trailers(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSeriesTrailersUseCase.execute(id);
  }

  @Get('series/:id/featured-trailer')
  @ApiOperation({ summary: 'Get the newest trailer for a series with video' })
  featuredTrailer(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSeriesFeaturedTrailerUseCase.execute(id);
  }

  @Get('playlists/:playlistId/episodes')
  @ApiOperation({ summary: 'Get episodes for a playlist' })
  episodes(@Param('playlistId', ParseUUIDPipe) playlistId: string) {
    return this.getPlaylistEpisodesUseCase.execute(playlistId);
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get episode release schedule for a date range' })
  schedule(@Query() query: GetScheduleQueryDto) {
    return this.getScheduleUseCase.execute(query);
  }

  @Get('season')
  @ApiOperation({ summary: 'Get playlists starting in a given anime season' })
  season(@Query() query: GetSeasonQueryDto) {
    return this.getSeasonUseCase.execute(query);
  }
}
