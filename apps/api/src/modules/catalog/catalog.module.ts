import { Module } from '@nestjs/common';

import { ContentClassificationsModule } from '@/modules/admin/content-classifications/content-classifications.module';
import { EpisodesModule } from '@/modules/admin/episodes/episodes.module';
import { GenresModule } from '@/modules/admin/genres/genres.module';
import { PlaylistsModule } from '@/modules/admin/playlists/playlists.module';
import { SeriesModule } from '@/modules/admin/series/series.module';
import { TrailersModule } from '@/modules/admin/trailers/trailers.module';
import { SeriesReviewsModule } from '@/modules/series-reviews/series-reviews.module';

import { CatalogController } from './catalog.controller';
import { ExploreSeriesUseCase } from './use-cases/explore-series.use-case';
import { GetPlaylistEpisodesUseCase } from './use-cases/get-playlist-episodes.use-case';
import { GetRecommendedUseCase } from './use-cases/get-recommended.use-case';
import { GetScheduleUseCase } from './use-cases/get-schedule.use-case';
import { GetSeasonUseCase } from './use-cases/get-season.use-case';
import { GetSeriesDetailUseCase } from './use-cases/get-series-detail.use-case';
import { GetSeriesFeaturedTrailerUseCase } from './use-cases/get-series-featured-trailer.use-case';
import { GetSeriesPlaylistsUseCase } from './use-cases/get-series-playlists.use-case';
import { GetSeriesTrailersUseCase } from './use-cases/get-series-trailers.use-case';
import { ListCategoriesUseCase } from './use-cases/list-categories.use-case';
import { ListClassificationsUseCase } from './use-cases/list-classifications.use-case';

@Module({
  imports: [
    SeriesModule,
    GenresModule,
    ContentClassificationsModule,
    PlaylistsModule,
    EpisodesModule,
    TrailersModule,
    SeriesReviewsModule,
  ],
  controllers: [CatalogController],
  providers: [
    GetRecommendedUseCase,
    GetSeriesDetailUseCase,
    GetSeriesPlaylistsUseCase,
    GetPlaylistEpisodesUseCase,
    GetSeriesTrailersUseCase,
    GetSeriesFeaturedTrailerUseCase,
    GetScheduleUseCase,
    GetSeasonUseCase,
    ExploreSeriesUseCase,
    ListCategoriesUseCase,
    ListClassificationsUseCase,
  ],
})
export class CatalogModule {}
