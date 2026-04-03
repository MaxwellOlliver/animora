import { Module } from '@nestjs/common';

import { ContentClassificationsModule } from '@/modules/admin/content-classifications/content-classifications.module';
import { EpisodesModule } from '@/modules/admin/episodes/episodes.module';
import { PlaylistsModule } from '@/modules/admin/playlists/playlists.module';
import { SeriesModule } from '@/modules/admin/series/series.module';
import { TrailersModule } from '@/modules/admin/trailers/trailers.module';
import { SeriesReviewsModule } from '@/modules/series-reviews/series-reviews.module';

import { CatalogController } from './catalog.controller';
import { GetPlaylistEpisodesUseCase } from './use-cases/get-playlist-episodes.use-case';
import { GetRecommendedUseCase } from './use-cases/get-recommended.use-case';
import { GetSeriesDetailUseCase } from './use-cases/get-series-detail.use-case';
import { GetSeriesPlaylistsUseCase } from './use-cases/get-series-playlists.use-case';
import { GetSeriesTrailersUseCase } from './use-cases/get-series-trailers.use-case';
import { GetSeriesFeaturedTrailerUseCase } from './use-cases/get-series-featured-trailer.use-case';

@Module({
  imports: [SeriesModule, ContentClassificationsModule, PlaylistsModule, EpisodesModule, TrailersModule, SeriesReviewsModule],
  controllers: [CatalogController],
  providers: [GetRecommendedUseCase, GetSeriesDetailUseCase, GetSeriesPlaylistsUseCase, GetPlaylistEpisodesUseCase, GetSeriesTrailersUseCase, GetSeriesFeaturedTrailerUseCase],
})
export class CatalogModule {}
